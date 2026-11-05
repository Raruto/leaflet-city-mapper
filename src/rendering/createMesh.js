import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { emptyNode } from '../scene/emptyNode.js';
import { createProgram } from './createProgram.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

/**
 * Add a non-indexed, vertex-coloured mesh from flat vec3 arrays `{ position, normal, color }` in layer-local metres.
 * `usage` adds GPUBufferUsage flags to the vertex buffers (e.g. STORAGE for compute passes).
 * A supplied `program` shares compiled shaders and pipelines across compatible meshes.
 */

export function createMesh(backend, data, material = sharedState.allocationRenderDefaultMaterial, usage = 0, program) {
  const gpuCreateBuffer1 = sharedState.allocationRenderCreateMeshCreateBuffer1;
  const { device } = pluginState(backend).renderer, attributes = /* allocation: required -- The returned mesh retains an independent vertex-attribute table. */ {};
  let name, values, array, size, buffer;
  for ([name, values] of Object.entries(data)) {
    array = /* allocation: required -- This mesh owns its CPU vertex data for later uploads and edits. */ new Float32Array(values);
    size = name === 'uv' ? 2 : 3;
    buffer = device.createBuffer((
      gpuCreateBuffer1.size = Math.max(4, array.byteLength),
      gpuCreateBuffer1.usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | usage,
      gpuCreateBuffer1
    ));

    device.queue.writeBuffer(buffer, 0, array);
    attributes[name] = /* allocation: required -- Each mesh attribute retains its own GPU buffer, CPU data and draw count. */ { size, data: array, count: array.length / size, buffer };
  }
  const mesh = /* allocation: required -- The scene retains this mesh until its owner disposes it. */ {
    ...emptyNode(),
    device,
    geometry: /* allocation: required -- The mesh owns its geometry metadata and GPU attribute references. */ { device, attributes, drawRange: /* allocation: required -- The mesh owns an independently mutable draw range. */ { start: 0, count: attributes.position.count } },
    program: program || createProgram(backend, /* allocation: required -- The returned program retains these mesh-specific material options. */ { vertexColors: true, doubleSided: true, ...material }),
    id: sharedState.nextId++, renderOrder: 0, extras: /* allocation: required -- Each mesh owns independently mutable feature and application metadata. */ {},
  };
  setParent(mesh, pluginState(backend).root);
  update(backend);
  return mesh;
}
