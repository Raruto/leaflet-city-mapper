import { shadowMeshLayout } from '../globals/shadowMeshLayout.js';
import { shadowDepthLayout } from '../globals/shadowDepthLayout.js';
import { depthBindGroup as sharedDepthBindGroup } from '../globals/depthBindGroup.js';
import { shadowShader } from '../globals/shadowShader.js';
import { shadowPipeline } from '../globals/shadowPipeline.js';
import { shadowPipelineLayout } from '../globals/shadowPipelineLayout.js';
import { shadowInstanceLayouts } from '../globals/shadowInstanceLayouts.js';
import { shadowLayouts } from '../globals/shadowLayouts.js';

export function ensureShadowPipeline(device, sun, instanced = false) {
  const key = instanced ? 'instancePipeline' : 'pipeline';
  if (!sun[key]) {
    if (!sun.meshLayout) {
      sun.meshLayout = device.createBindGroupLayout((
        shadowMeshLayout.entries[0].visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        shadowMeshLayout
      ));

      // Do not bind the sampled depth texture while it is a render attachment.
      sun.depthLayout = device.createBindGroupLayout((
        shadowDepthLayout.entries[0].visibility = GPUShaderStage.VERTEX,
        shadowDepthLayout
      ));

      sun.depthBindGroup = device.createBindGroup((
        sharedDepthBindGroup.layout = sun.depthLayout,
        sharedDepthBindGroup.entries[0].resource.buffer = sun.buffer,
        sharedDepthBindGroup
      ));
      sharedDepthBindGroup.layout = null;
      sharedDepthBindGroup.entries[0].resource.buffer = null;
    }
    const shader = device.createShaderModule((
      shadowShader.code = /* wgsl */`
      struct Mesh { world: mat4x4<f32>, padding: array<vec4<f32>, 4>, highlight: vec4<f32> };
      @group(0) @binding(0) var<uniform> mesh: Mesh;
      @group(1) @binding(0) var<uniform> matrix: mat4x4<f32>;
      @vertex fn main(@location(0) position: vec3<f32>${instanced ? ', @location(4) offset: vec4<f32>' : ''}) -> @builtin(position) vec4<f32> {
        return matrix * mesh.world * vec4<f32>(position${instanced ? ' + offset.xyz' : ''}, 1.0);
      }
      @fragment fn fragmentMain(@builtin(position) position: vec4<f32>) {
        let noise = fract(52.9829189 * fract(dot(floor(position.xy), vec2<f32>(0.06711056, 0.00583715))));
        if (mesh.highlight.w < 1.0 && noise >= mesh.highlight.w) { discard; }
      }
    `,
      shadowShader
    ));
    shadowShader.code = null;
    const buffers = instanced ? shadowInstanceLayouts : shadowLayouts;
    sun[key] = device.createRenderPipeline((
      shadowPipeline.layout = device.createPipelineLayout((shadowPipelineLayout.bindGroupLayouts[0] = sun.meshLayout, shadowPipelineLayout.bindGroupLayouts[1] = sun.depthLayout, shadowPipelineLayout)),
      shadowPipeline.vertex.module = shader,
      shadowPipeline.vertex.buffers = buffers,
      shadowPipeline.fragment.module = shader,
      shadowPipeline
    ));
    shadowPipelineLayout.bindGroupLayouts[0] = null;
    shadowPipelineLayout.bindGroupLayouts[1] = null;
    shadowPipeline.layout = null;
    shadowPipeline.vertex.module = null;
    shadowPipeline.vertex.buffers = null;
    shadowPipeline.fragment.module = null;
  }
}
