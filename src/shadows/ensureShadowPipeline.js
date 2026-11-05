export function ensureShadowPipeline(device, sun) {
  if (!sun.pipeline) {
    sun.meshLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform', hasDynamicOffset: true } },
      ]
    });
    // Do not bind the sampled depth texture while it is a render attachment.
    sun.depthLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      ]
    });
    sun.depthBindGroup = device.createBindGroup({
      layout: sun.depthLayout, entries: [{ binding: 0, resource: { buffer: sun.buffer } }],
    });
    const shader = device.createShaderModule({
      code: /* wgsl */ `
      struct Mesh { world: mat4x4<f32>, padding: array<vec4<f32>, 4>, highlight: vec4<f32> };
      @group(0) @binding(0) var<uniform> mesh: Mesh;
      @group(1) @binding(0) var<uniform> matrix: mat4x4<f32>;
      @vertex fn main(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
        return matrix * mesh.world * vec4<f32>(position, 1.0);
      }
      @fragment fn fragmentMain(@builtin(position) position: vec4<f32>) {
        let noise = fract(52.9829189 * fract(dot(floor(position.xy), vec2<f32>(0.06711056, 0.00583715))));
        if (mesh.highlight.w < 1.0 && noise >= mesh.highlight.w) { discard; }
      }
    ` });
    sun.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [sun.meshLayout, sun.depthLayout] }),
      vertex: {
        module: shader, entryPoint: 'main', buffers: [
          { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
        ]
      },
      fragment: { module: shader, entryPoint: 'fragmentMain', targets: [] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: {
        format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less',
        depthBias: 2, depthBiasSlopeScale: 2
      },
    });
  }
}
