import { roofVertexShader } from './roofVertexShader.js';

export function materialVertexShader(material, sparkle, elevationWGSL, hasTerrain, textured, hasRoof) {
  const instanceOffset = material.instanced ? ' + input.instanceOffset.xyz' : '';
  return /* wgsl */ `
    struct Mesh {
      worldMatrix: mat4x4<f32>,
      baseColor: vec4<f32>,
      material: vec4<f32>,
      emissive: vec4<f32>,
      terrain: vec4<f32>,
      highlight: vec4<f32>,
      cutout: vec4<f32>,
    };
    struct Frame {
      viewMatrix: mat4x4<f32>,
      projectionMatrix: mat4x4<f32>,
      roofMatrix: mat4x4<f32>,
      lightDirection: vec4<f32>,
      skyDirection: vec4<f32>,
      atmosphereTint: vec4<f32>,
    };
    @group(0) @binding(0) var<uniform> u: Mesh;
    @group(0) @binding(1) var<uniform> frame: Frame;
    struct Solar { matrix: mat4x4<f32>, params: vec4<f32> };
    @group(1) @binding(0) var<uniform> solar: Solar;
    ${hasTerrain ? /* wgsl */ `@group(0) @binding(2) var dem: texture_2d<f32>;${elevationWGSL}` : ''}
    struct VertexInput {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
      ${material.instanced ? '@location(4) instanceOffset: vec4<f32>,' : ''}
      ${material.vertexColors ? '@location(2) color: vec3<f32>,' : ''}
      ${textured ? '@location(3) uv: vec2<f32>,' : ''}
    };
    struct VertexOutput {
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
    @vertex fn vertexMain(input: VertexInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
      var output: VertexOutput;
      var position = input.position${instanceOffset};
      ${hasTerrain ? 'position.y = elevation(u.terrain.xy + input.uv * u.terrain.z, u.terrain.w) - u.terrain.w;' : ''}
      let featureVertex = f32(vertexIndex)${material.instanced ? ' + input.instanceOffset.w' : ''};
      let highlighted = featureVertex >= u.highlight.x && featureVertex < u.highlight.y;
      output.color = ${material.vertexColors
      ? 'select(input.color, vec3<f32>(72.0 / 255.0, 217.0 / 255.0, 1.0), highlighted)'
      : 'u.baseColor.rgb'};
      // Inverse-transpose from cofactors; the camera view matrix is orthonormal.
      let m = mat3x3<f32>(u.worldMatrix[0].xyz, u.worldMatrix[1].xyz, u.worldMatrix[2].xyz);
      let normal = (cross(m[1], m[2]) * input.normal.x + cross(m[2], m[0]) * input.normal.y +
        cross(m[0], m[1]) * input.normal.z) / determinant(m);
      output.normal = (frame.viewMatrix * vec4<f32>(normal, 0.0)).xyz;
      let world = u.worldMatrix * vec4<f32>(position, 1.0);
      output.shadowPosition = solar.matrix * world;
      output.worldPosition = world.xyz / world.w;
      ${sparkle ? `output.localPosition = input.position${instanceOffset};` : ''}
      let viewPosition = frame.viewMatrix * world;
      output.viewPosition = viewPosition.xyz;
      ${textured ? 'output.uv = input.uv;' : ''}
      ${hasRoof ? roofVertexShader(material) : ''}
      output.position = frame.projectionMatrix * viewPosition;
      return output;
    }
  `;
}
