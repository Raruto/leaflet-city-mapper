export function meshShadowBounds(mesh, bounds, matrix) {
  let cached = mesh._shadowBounds;
  if (!cached || cached.version !== mesh._worldMatrixVersion || cached.bounds !== bounds) {
    cached ||= mesh._shadowBounds = /* alloc */ {
      min: /* alloc */ [Infinity, Infinity, Infinity],
      max: /* alloc */ [-Infinity, -Infinity, -Infinity],
    };
    cached.version = mesh._worldMatrixVersion;
    cached.bounds = bounds;
    cached.min.fill(Infinity); cached.max.fill(-Infinity);
    let i, x, y, z, w, axis, value;
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
  return cached;
}
