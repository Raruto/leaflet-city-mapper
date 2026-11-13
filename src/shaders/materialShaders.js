import { defaultMaterial } from '../globals/defaultMaterial.js';
import { textureBinding } from '../textures/textureBinding.js';
import { validateRoofMaterial } from '../materials/validateRoofMaterial.js';
import { materialVertexShader } from './materialVertexShader.js';
import { materialSurfaceShader } from './materialSurfaceShader.js';

/**
 * Generate material WGSL and texture bindings without a GPU device or Leaflet layer.
 *
 * @param {Object} [material] Material settings.
 * @param {boolean} [sparkle=false] Whether to include sparkle coordinates and shading.
 * @param {string} [elevationWGSL=''] Terrain elevation WGSL functions.
 *
 * @returns {Object} Vertex and fragment shaders, texture bindings and feature flags.
 */
export function materialShaders(material = defaultMaterial, sparkle = false, elevationWGSL = '') {
  const hasBase = Boolean(material.baseTexture);
  const hasMetal = Boolean(material.metalTexture);
  const hasEmissive = Boolean(material.emissiveTexture);
  const hasOcclusion = Boolean(material.occlusionTexture);
  const hasRoof = Boolean(material.roofTexture || material.wallTexture);
  validateRoofMaterial(material);
  const hasTerrain = Boolean(material.terrain);
  const textured = hasBase || hasMetal || hasEmissive || hasOcclusion || material.nightLight;
  const vertex = materialVertexShader(material, sparkle, elevationWGSL, hasTerrain, textured, hasRoof);
  const bindings = /* alloc */ [];
  const baseBinding = textureBinding(bindings, 'baseTexture', hasBase);
  const metalBinding = textureBinding(bindings, 'metalTexture', hasMetal);
  const emissiveBinding = textureBinding(bindings, 'emissiveTexture', hasEmissive);
  const occlusionBinding = textureBinding(bindings, 'occlusionTexture', hasOcclusion);
  const roofBinding = textureBinding(bindings, 'roofTexture', hasRoof);
  const fragment = /* wgsl */ `
    struct Mesh {
      worldMatrix: mat4x4<f32>,
      baseColor: vec4<f32>,
      material: vec4<f32>,
      emissive: vec4<f32>,
      terrain: vec4<f32>,
      highlight: vec4<f32>,
      cutout: vec4<f32>,
      nativeStroke: vec4<f32>,
    };
    struct Frame {
      viewMatrix: mat4x4<f32>,
      projectionMatrix: mat4x4<f32>,
      roofMatrix: mat4x4<f32>,
      lightDirection: vec4<f32>,
      skyDirection: vec4<f32>,
      atmosphereTint: vec4<f32>,
    };
    struct Solar {
      matrix: mat4x4<f32>,
      params: vec4<f32>,
    };
    @group(0) @binding(0) var<uniform> u: Mesh;
    @group(0) @binding(1) var<uniform> frame: Frame;
    @group(1) @binding(0) var<uniform> solar: Solar;
    @group(1) @binding(1) var shadowTexture: texture_depth_2d;
    @group(1) @binding(2) var shadowSampler: sampler_comparison;
    @group(1) @binding(3) var<storage, read> lightGrid: array<vec4<f32>>;
    ${baseBinding}${metalBinding}${emissiveBinding}${occlusionBinding}${roofBinding}
    struct FragmentInput {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) viewPosition: vec3<f32>,
      @location(6) shadowPosition: vec4<f32>,
      @location(7) worldPosition: vec3<f32>,
      ${sparkle ? '@location(8) localPosition: vec3<f32>,' : ''}
      ${textured ? '@location(3) uv: vec2<f32>,' : ''}
      ${hasRoof ? '@location(4) roofUv: vec2<f32>, @location(5) roof: f32,' : ''}
    };
    const PI: f32 = 3.14159265;
    fn toLinear(c: vec3<f32>) -> vec3<f32> {
      return select(c / 12.92, pow((c + vec3<f32>(0.055)) / 1.055, vec3<f32>(2.4)), c >= vec3<f32>(0.04045));
    }
    fn toSRGB(c: vec3<f32>) -> vec3<f32> {
      return select(c * 12.92, 1.055 * pow(max(c, vec3<f32>(0.0)), vec3<f32>(1.0 / 2.4)) - vec3<f32>(0.055), c >= vec3<f32>(0.0031308));
    }
    fn sunVisibility(position: vec4<f32>) -> f32 {
      let p = position.xyz / position.w;
      let uv = vec2<f32>(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
      if (solar.params.x < 0.5 || any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0)) || p.z < 0.0 || p.z > 1.0) {
        return 1.0;
      }
      return textureSampleCompareLevel(shadowTexture, shadowSampler, uv, p.z - 0.0003);
    }
    fn gridLighting(position: vec3<f32>, normal: vec3<f32>, offset: u32) -> vec3<f32> {
      let grid = lightGrid[offset];
      if (grid.w < 1.0) { return vec3<f32>(0.0); }
      let cell = vec2<i32>(floor((position.xz - grid.xy) / grid.z));
      if (any(cell < vec2<i32>(0)) || cell.x >= i32(grid.w) || cell.y >= i32(lightGrid[offset + 1u].x)) {
        return vec3<f32>(0.0);
      }
      let header = lightGrid[offset + 2u + u32(cell.y) * u32(grid.w) + u32(cell.x)];
      var light = vec3<f32>(0.0);
      for (var i = 0u; i < u32(header.y); i++) {
        let source = lightGrid[offset + u32(header.x) + i * 2u];
        let colour = lightGrid[offset + u32(header.x) + i * 2u + 1u];
        let delta = source.xyz - position;
        let distance2 = max(dot(delta, delta), 1.0);
        let falloff = max(0.0, 1.0 - distance2 / (source.w * source.w));
        let lambert = max(0.0, dot(normal, delta / sqrt(distance2)));
        light += toLinear(colour.rgb) * colour.w * lambert * falloff * falloff / distance2;
      }
      return light;
    }
    fn localLighting(position: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
      if (frame.skyDirection.w <= 0.0) { return vec3<f32>(0.0); }
      var light = gridLighting(position, normal, 0u);
      let moving = u32(lightGrid[1].z);
      if (moving > 0u) { light += gridLighting(position, normal, moving); }
      return light * frame.skyDirection.w;
    }
    fn appearance(position: vec2<f32>) {
      // Screen-door dissolve keeps opaque depth writes and avoids sorting whole buildings as glass.
      let noise = fract(52.9829189 * fract(dot(floor(position), vec2<f32>(0.06711056, 0.00583715))));
      if (u.highlight.w < 1.0 && noise >= u.highlight.w) { discard; }
    }
    @fragment fn fragmentMain(input: FragmentInput, @builtin(front_facing) frontFacing: bool) -> @location(0) vec4<f32> {
      let cutoutDistance = distance(input.position.xy, u.cutout.xy);
      if (select((cutoutDistance < u.cutout.z), (cutoutDistance >= u.cutout.z), u.cutout.w > 0.0)) { discard; }
      ${material.nightLight ? /* wgsl */ `
        if (input.uv.x <= 2.0) {
        let radial = max(0.0, 1.0 - dot(input.uv, input.uv));
        let alpha = radial * radial * frame.skyDirection.w * 0.65;
        if (alpha < 0.005) { discard; }
        appearance(input.position.xy);
        return vec4<f32>(input.color, alpha);
        }
      ` : ''}
      let sunlight = sunVisibility(input.shadowPosition);
      let worldNormal = normalize(transpose(mat3x3<f32>(frame.viewMatrix[0].xyz, frame.viewMatrix[1].xyz, frame.viewMatrix[2].xyz)) * normalize(input.normal)) * select(-1.0, 1.0, frontFacing);
      let artificial = localLighting(input.worldPosition, worldNormal);
      ${materialSurfaceShader(material, sparkle, hasBase, hasMetal, hasEmissive, hasOcclusion, hasRoof)}
    }
  `;
  return /* alloc */ { vertex, fragment, bindings, textured, hasTerrain };
}
