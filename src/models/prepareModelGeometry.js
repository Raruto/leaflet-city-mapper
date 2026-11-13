import { geometryEmpty } from '../globals/geometryEmpty.js';
import { prepareModelPrimitive } from './prepareModelPrimitive.js';

/**
 * Prepare geometry for meshes reachable from the scene and collect their buffers.
 *
 * @param {Object} description Decoded glTF document with loaded buffers.
 * @param {Object} scene glTF scene containing root node indices.
 *
 * @returns {Array<ArrayBuffer>} Unique geometry buffers to transfer.
 *
 * @throws {Error} If a referenced node is invalid.
 */
export function prepareModelGeometry(description, scene) {
  const pending = scene.nodes.slice(), visited = /* alloc */ new Set();
  const meshes = /* alloc */ new Set(), transfers = /* alloc */ new Set();
  let index, spec, primitive, attribute, child;
  while (pending.length) {
    index = pending.pop();
    if (visited.has(index)) continue;
    visited.add(index);
    spec = description.nodes[index];
    if (!spec) throw /* alloc */ new Error('Invalid glTF node');
    if (spec.mesh !== undefined) meshes.add(spec.mesh);
    for (child of spec.children || geometryEmpty) pending.push(child);
  }
  for (index of meshes) {
    for (primitive of description.meshes[index].primitives) {
      for (attribute of Object.values(prepareModelPrimitive(description, primitive))) {
        transfers.add(attribute.data.buffer);
      }
    }
  }
  return /* alloc */ [...transfers];
}
