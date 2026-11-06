import { computeBounds } from './computeBounds.js';
import { meshShadowBounds } from './meshShadowBounds.js';

export function shadowBounds(meshes, output = /* alloc */ {
  min: /* alloc */ [Infinity, Infinity, Infinity],
  max: /* alloc */ [-Infinity, -Infinity, -Infinity],
}) {
  const { min, max } = output;
  min.fill(Infinity); max.fill(-Infinity);
  let mesh, bounds, matrix, cached, axis;
  for (mesh of meshes) {
    if (!mesh.geometry.bounds || mesh.geometry.attributes.position.needsUpdate) computeBounds(mesh.geometry);
    bounds = mesh.geometry.bounds, matrix = mesh.worldMatrix;
    cached = meshShadowBounds(mesh, bounds, matrix);
    for (axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], cached.min[axis]);
      max[axis] = Math.max(max[axis], cached.max[axis]);
    }
  }
  // Include ground receivers below/around the loaded buildings and trees.
  min[1] = Math.min(0, min[1]);
  return output;
}
