import { nextId } from '../globals/nextId.js';
import { geometryEmpty } from '../globals/geometryEmpty.js';

import { emptyNode } from '../scene/emptyNode.js';
import { nodeMatrix } from './nodeMatrix.js';
import { setParent } from '../scene/setParent.js';
import { readModelAttributes } from './readModelAttributes.js';
import { readModelIndices } from './readModelIndices.js';
import { createModelGeometry } from './createModelGeometry.js';

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
  let primitive, attributeData, attributes, vertexCount, built, mesh, child;
  if (spec.mesh !== undefined) {
    for (primitive of description.meshes[spec.mesh].primitives) {
      attributeData = readModelAttributes(description, primitive);
      attributes = attributeData.attributes;
      vertexCount = attributeData.vertexCount;
      readModelIndices(description, primitive, attributes, vertexCount);
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
