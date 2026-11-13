import { nextId } from '../globals/nextId.js';
import { geometryEmpty } from '../globals/geometryEmpty.js';
import { emptyNode } from '../scene/createSceneNode.js';
import { nodeMatrix } from '../transforms/modelNodeMatrix.js';
import { setParent } from '../scene/setParent.js';
import { createModelGeometry } from '../geometry/createModelGeometry.js';

/**
 * Recursively construct a scene node and its mesh primitives and children.
 *
 * @param {Object} context Model construction context.
 * @param {number} index Index into the glTF nodes array.
 *
 * @returns {Object} Constructed scene node.
 *
 * @throws {Error} If the node forms a cycle.
 * @throws {Error} If the node index is invalid.
 */
export function modelNode(context, index) {
  const { backend: layer, description, active } = context;
  // Track only the recursion path: shared mesh references are valid, cycles are not.
  if (active.has(index)) throw /* alloc */ new Error('Cyclic glTF nodes');
  const spec = description.nodes[index];
  if (!spec) throw /* alloc */ new Error('Invalid glTF node');
  active.add(index);
  const group = /* alloc */ {
    ...emptyNode(),
    name: spec.name
  };
  group.matrix = nodeMatrix(spec);
  let primitive, attributes, built, mesh, child;
  if (spec.mesh !== undefined) {
    for (primitive of description.meshes[spec.mesh].primitives) {
      // Node instances own their CPU data and GPU buffers, even when they share a glTF mesh.
      attributes = structuredClone(primitive.preparedAttributes);
      built = createModelGeometry(context, primitive, attributes);
      mesh = /* alloc */ {
        ...emptyNode(),
        device: built.device,
        geometry: built.geometry,
        program: built.program,
        fadeDuration: 250,
        id: nextId.value++,
        renderOrder: 0
      };
      mesh.name = description.meshes[spec.mesh].name;
      mesh.extras = spec.extras || /* alloc */ {};
      setParent(mesh, group);
    }
  }
  for (child of spec.children || geometryEmpty) setParent(modelNode(context, child), group);
  active.delete(index);
  return group;
}
