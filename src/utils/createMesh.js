import { emptyNode } from './emptyNode';
import { createProgram } from './createProgram';

/**
 * Add a non-indexed, vertex-coloured mesh from flat vec3 arrays `{ position, normal, color }` in layer-local metres.
 * `usage` adds GPUBufferUsage flags to the vertex buffers (e.g. STORAGE for compute passes).
 */

export function createMesh(backend, data, material = {}, usage = 0) {
  const { device } = backend.renderer, attributes = {};
  for (const [name, values] of Object.entries(data)) {
    const array = new Float32Array(values);
    const buffer = device.createBuffer({ size: Math.max(4, array.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | usage });
    device.queue.writeBuffer(buffer, 0, array);
    attributes[name] = { size: 3, data: array, count: array.length / 3, buffer };
  }
  const mesh = {
    ...emptyNode(),
    device,
    geometry: { device, attributes, drawRange: { start: 0, count: attributes.position.count } },
    program: createProgram(backend, { vertexColors: true, doubleSided: true, ...material }),
    id: L.Layer.types['3d']._nextId++, renderOrder: 0, extras: {},
  };
  backend.add(mesh);
  return mesh;
}
