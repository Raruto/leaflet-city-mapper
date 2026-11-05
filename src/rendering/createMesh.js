import { cityMapper } from '../constants/cityMapper.js';
import { emptyNode } from '../scene/emptyNode.js';
import { createProgram } from './createProgram.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

/**
 * Add a non-indexed, vertex-coloured mesh from flat vec3 arrays `{ position, normal, color }` in layer-local metres.
 * `usage` adds GPUBufferUsage flags to the vertex buffers (e.g. STORAGE for compute passes).
 * A supplied `program` shares compiled shaders and pipelines across compatible meshes.
 */

export function createMesh(backend, data, material = {}, usage = 0, program) {
  const { device } = backend.renderer, attributes = {};
  for (const [name, values] of Object.entries(data)) {
    const array = new Float32Array(values);
    const size = name === 'uv' ? 2 : 3;
    const buffer = device.createBuffer({ size: Math.max(4, array.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | usage });
    device.queue.writeBuffer(buffer, 0, array);
    attributes[name] = { size, data: array, count: array.length / size, buffer };
  }
  const mesh = {
    ...emptyNode(),
    device,
    geometry: { device, attributes, drawRange: { start: 0, count: attributes.position.count } },
    program: program || createProgram(backend, { vertexColors: true, doubleSided: true, ...material }),
    id: cityMapper.nextId++, renderOrder: 0, extras: {},
  };
  setParent(mesh, backend.root);
  update(backend);
  return mesh;
}
