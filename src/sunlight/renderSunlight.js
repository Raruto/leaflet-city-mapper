import { computeBounds } from '../geometry/computeBounds.js';
import { updateCamera } from '../scene/updateCamera.js';
import { resizeSunlight } from './resizeSunlight.js';

/** One shared directional depth map. Off-screen but loaded geometry can cast shadows. */

export function renderSunlight(backend, encoder, meshes, sunlight) {
  const renderer = backend.renderer, device = renderer.device, sun = renderer.sunlight;
  if (!meshes.length || !sunlight || sunlight.altitude < 3) {
    if (!sun.enabled) return;
    const values = new Float32Array(20);
    values.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    device.queue.writeBuffer(sun.buffer, 0, values);
    sun.enabled = false;
    sun.cache = null;
    return;
  }
  const cache = sun.cache;
  const unchanged = sun.enabled && cache?.meshes.size === meshes.length &&
    sunlight.direction.every((value, i) => value === cache.direction[i]) &&
    meshes.every(mesh => {
      const previous = cache.meshes.get(mesh), range = mesh.geometry.drawRange;
      return previous && previous.world === mesh._worldMatrixVersion && previous.geometry === mesh.geometry &&
        previous.start === range.start && previous.count === range.count &&
        previous.appearance === (mesh._appearance ?? 1) &&
        Object.values(mesh.geometry.attributes).every(attribute => !attribute.needsUpdate);
    });
  if (unchanged) return;
  const values = new Float32Array(20);
  sun.enabled = true;
  resizeSunlight(backend, Math.min(2048, device.limits.maxTextureDimension2D));
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const mesh of meshes) {
    if (!mesh.geometry.bounds || mesh.geometry.attributes.position.needsUpdate) computeBounds(mesh.geometry);
    const bounds = mesh.geometry.bounds, matrix = mesh.worldMatrix;
    let cached = mesh._shadowBounds;
    if (!cached || cached.version !== mesh._worldMatrixVersion || cached.bounds !== bounds) {
      cached = mesh._shadowBounds = { version: mesh._worldMatrixVersion, bounds,
        min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
      for (let i = 0; i < 8; i++) {
        const x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
        const z = i & 4 ? bounds.max[2] : bounds.min[2];
        const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        for (let axis = 0; axis < 3; axis++) {
          const value = (matrix[axis] * x + matrix[axis + 4] * y + matrix[axis + 8] * z + matrix[axis + 12]) / w;
          cached.min[axis] = Math.min(cached.min[axis], value);
          cached.max[axis] = Math.max(cached.max[axis], value);
        }
      }
    }
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], cached.min[axis]);
      max[axis] = Math.max(max[axis], cached.max[axis]);
    }
  }
  // Include ground receivers below/around the loaded buildings and trees.
  min[1] = Math.min(0, min[1]);
  const radius = Math.max(100, Math.hypot(...min.map((v, i) => max[i] - v)));
  const center = min.map((v, i) => (v + max[i]) / 2);
  const lightCamera = {
    position: center.map((v, i) => v + sunlight.direction[i] * radius * 2),
    target: center, up: [0, 0, -1], fov: 45, aspect: 1, near: 1, far: radius * 5,
    viewMatrix: [], projectionMatrix: [], projectionViewMatrix: [],
  };
  updateCamera(lightCamera);
  const view = new DOMMatrix(lightCamera.viewMatrix);
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < 8; i++) {
    const point = new DOMPoint(...min.map((v, axis) => (i & (1 << axis)) ? max[axis] : v), 1).matrixTransform(view);
    [point.x, point.y, point.z].forEach((value, axis) => {
      low[axis] = Math.min(low[axis], value - 20);
      high[axis] = Math.max(high[axis], value + 20);
    });
  }
  const span = low.map((v, i) => high[i] - v);
  const projection = new DOMMatrix([
    2 / span[0], 0, 0, 0, 0, 2 / span[1], 0, 0, 0, 0, -1 / span[2], 0,
    -(high[0] + low[0]) / span[0], -(high[1] + low[1]) / span[1], high[2] / span[2], 1,
  ]);
  values.set(projection.multiply(view).toFloat32Array());
  values[16] = 1;
  device.queue.writeBuffer(sun.buffer, 0, values);
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
  const pass = encoder.beginRenderPass({
    colorAttachments: [],
    depthStencilAttachment: {
      view: sun.texture.createView(), depthClearValue: 1,
      depthLoadOp: 'clear', depthStoreOp: 'store'
    },
  });
  pass.setPipeline(sun.pipeline);
  pass.setBindGroup(1, sun.depthBindGroup);
  for (const mesh of meshes) {
    const offset = renderer.uniformSlot++ * 256;
    renderer.uniformData.set(mesh.worldMatrix, offset / 4);
    renderer.uniformData[offset / 4 + 35] = mesh._appearance ?? 1;
    if (mesh._shadowBuffer !== renderer.uniformBuffer) {
      mesh._shadowBuffer = renderer.uniformBuffer;
      mesh._shadowBindGroup = device.createBindGroup({
        layout: sun.meshLayout, entries: [
          { binding: 0, resource: { buffer: renderer.uniformBuffer, size: 144 } },
        ]
      });
    }
    for (const attribute of Object.values(mesh.geometry.attributes)) {
      if (attribute.needsUpdate) {
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
        attribute.needsUpdate = false;
      }
    }
    pass.setBindGroup(0, mesh._shadowBindGroup, [offset]);
    pass.setVertexBuffer(0, mesh.geometry.attributes.position.buffer);
    const index = mesh.geometry.attributes.index, range = mesh.geometry.drawRange;
    if (index) {
      pass.setIndexBuffer(index.buffer, index.indexFormat);
      pass.drawIndexed(range.count, 1, range.start, 0, 0);
    } else pass.draw(range.count, 1, range.start, 0);
  }
  pass.end();
  sun.cache = {
    direction: [...sunlight.direction],
    meshes: new Map(meshes.map(mesh => [mesh, {
      world: mesh._worldMatrixVersion, geometry: mesh.geometry,
      start: mesh.geometry.drawRange.start, count: mesh.geometry.drawRange.count,
      appearance: mesh._appearance ?? 1,
    }])),
  };
}
