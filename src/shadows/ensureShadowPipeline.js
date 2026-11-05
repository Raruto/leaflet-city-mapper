import { state as sharedState } from '../state.js';
export function ensureShadowPipeline(device, sun, instanced = false) {
  const gpuCreateBindGroupLayout1 = sharedState.allocationRenderEnsureShadowPipelineCreateBindGroupLayout1;
  const gpuCreateBindGroupLayout2 = sharedState.allocationRenderEnsureShadowPipelineCreateBindGroupLayout2;
  const gpuCreateBindGroup3 = sharedState.allocationRenderEnsureShadowPipelineCreateBindGroup3;
  const gpuCreateShaderModule4 = sharedState.allocationRenderEnsureShadowPipelineCreateShaderModule4;
  const gpuCreateRenderPipeline5 = sharedState.allocationRenderEnsureShadowPipelineCreateRenderPipeline5;
  const gpuCreatePipelineLayout1 = sharedState.allocationRenderEnsureShadowPipelineCreatePipelineLayout1;
  const key = instanced ? 'instancePipeline' : 'pipeline';
  if (!sun[key]) {
    if (!sun.meshLayout) {
      sun.meshLayout = device.createBindGroupLayout((
        gpuCreateBindGroupLayout1.entries[0].visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        gpuCreateBindGroupLayout1
      ));

      // Do not bind the sampled depth texture while it is a render attachment.
      sun.depthLayout = device.createBindGroupLayout((
        gpuCreateBindGroupLayout2.entries[0].visibility = GPUShaderStage.VERTEX,
        gpuCreateBindGroupLayout2
      ));

      sun.depthBindGroup = device.createBindGroup((
        gpuCreateBindGroup3.layout = sun.depthLayout,
        gpuCreateBindGroup3.entries[0].resource.buffer = sun.buffer,
        gpuCreateBindGroup3
      ));
      gpuCreateBindGroup3.layout = null;
      gpuCreateBindGroup3.entries[0].resource.buffer = null;
    }
    const shader = device.createShaderModule((
      gpuCreateShaderModule4.code = `
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
      gpuCreateShaderModule4
    ));
    gpuCreateShaderModule4.code = null;
    const buffers = instanced ? sharedState.allocationRenderShadowInstanceLayouts : sharedState.allocationRenderShadowLayouts;
    sun[key] = device.createRenderPipeline((
      gpuCreateRenderPipeline5.layout = device.createPipelineLayout((gpuCreatePipelineLayout1.bindGroupLayouts[0] = sun.meshLayout, gpuCreatePipelineLayout1.bindGroupLayouts[1] = sun.depthLayout, gpuCreatePipelineLayout1)),
      gpuCreateRenderPipeline5.vertex.module = shader,
      gpuCreateRenderPipeline5.vertex.buffers = buffers,
      gpuCreateRenderPipeline5.fragment.module = shader,
      gpuCreateRenderPipeline5
    ));
    gpuCreatePipelineLayout1.bindGroupLayouts[0] = null;
    gpuCreatePipelineLayout1.bindGroupLayouts[1] = null;
    gpuCreateRenderPipeline5.layout = null;
    gpuCreateRenderPipeline5.vertex.module = null;
    gpuCreateRenderPipeline5.vertex.buffers = null;
    gpuCreateRenderPipeline5.fragment.module = null;
  }
}
