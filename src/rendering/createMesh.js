import { defaultMaterial } from '../globals/defaultMaterial.js';
import { meshBuffer } from '../globals/meshBuffer.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { nextId } from '../globals/nextId.js';



import { emptyNode } from '../scene/emptyNode.js';
import { createProgram } from './createProgram.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

/**
 * Add a non-indexed, vertex-coloured mesh from flat vec3 arrays `{ position, normal, color }` in layer-local metres.
 * `usage` adds GPUBufferUsage flags to the vertex buffers (e.g. STORAGE for compute passes).
 * A supplied `program` shares compiled shaders and pipelines across compatible meshes.
 */

export function createMesh(backend, data, material = defaultMaterial, usage = 0, program) {
  const { device } = sceneByLayer.get(backend).renderer, attributes = /* alloc */ {};
  let name, values, array, size, buffer;
  for ([name, values] of Object.entries(data)) {
    array = /* alloc */ new Float32Array(values);
    size = name === 'uv' ? 2 : 3;
    buffer = device.createBuffer((
      meshBuffer.size = Math.max(4, array.byteLength),
      meshBuffer.usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | usage,
      meshBuffer
    ));

    device.queue.writeBuffer(buffer, 0, array);
    attributes[name] = /* alloc */ { size, data: array, count: array.length / size, buffer };
  }
  const mesh = /* alloc */ {
    ...emptyNode(),
    device,
    geometry: /* alloc */ { device, attributes, drawRange: /* alloc */ { start: 0, count: attributes.position.count } },
    program: program || createProgram(backend, /* alloc */ { vertexColors: true, doubleSided: true, ...material }),
    id: nextId.value++, renderOrder: 0, extras: /* alloc */ {},
  };
  setParent(mesh, sceneByLayer.get(backend).root);
  update(backend);
  return mesh;
}
