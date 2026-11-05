import { computeBounds } from '../geometry/computeBounds.js';

export function shadowBounds(meshes, output = /* allocation: required -- Callers without an output buffer own independent world bounds. */ {
  min: /* allocation: required -- The returned bounds own their mutable minimum vector. */ [Infinity, Infinity, Infinity],
  max: /* allocation: required -- The returned bounds own their mutable maximum vector. */ [-Infinity, -Infinity, -Infinity],
}) {
  const { min, max } = output;
  min.fill(Infinity); max.fill(-Infinity);
  let mesh, bounds, matrix, cached, i, x, y, z, w, axis, value;
  for (mesh of meshes) {
    if (!mesh.geometry.bounds || mesh.geometry.attributes.position.needsUpdate) computeBounds(mesh.geometry);
    bounds = mesh.geometry.bounds, matrix = mesh.worldMatrix;
    cached = mesh._shadowBounds;
    if (!cached || cached.version !== mesh._worldMatrixVersion || cached.bounds !== bounds) {
      cached ||= mesh._shadowBounds = /* allocation: required -- Each mesh retains its own transformed bounds cache. */ {
        min: /* allocation: required -- The mesh cache owns its mutable minimum vector. */ [Infinity, Infinity, Infinity],
        max: /* allocation: required -- The mesh cache owns its mutable maximum vector. */ [-Infinity, -Infinity, -Infinity],
      };
      cached.version = mesh._worldMatrixVersion;
      cached.bounds = bounds;
      cached.min.fill(Infinity); cached.max.fill(-Infinity);
      for (i = 0; i < 8; i++) {
        x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
        z = i & 4 ? bounds.max[2] : bounds.min[2];
        w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        for (axis = 0; axis < 3; axis++) {
          value = (matrix[axis] * x + matrix[axis + 4] * y + matrix[axis + 8] * z + matrix[axis + 12]) / w;
          cached.min[axis] = Math.min(cached.min[axis], value);
          cached.max[axis] = Math.max(cached.max[axis], value);
        }
      }
    }
    for (axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], cached.min[axis]);
      max[axis] = Math.max(max[axis], cached.max[axis]);
    }
  }
  // Include ground receivers below/around the loaded buildings and trees.
  min[1] = Math.min(0, min[1]);
  return output;
}
