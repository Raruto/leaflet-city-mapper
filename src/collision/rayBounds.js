import { computeBounds } from '../geometry/computeBounds.js';

export function rayBounds(mesh, origin, direction) {
  if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
  let near = 0, far = Infinity, i, a, b;
  for (i = 0; i < 3; i++) {
    if (Math.abs(direction[i]) < 1e-12) {
      if (origin[i] < mesh.geometry.bounds.min[i] || origin[i] > mesh.geometry.bounds.max[i]) {
        far = -Infinity;
        break;
      }
    } else {
      a = (mesh.geometry.bounds.min[i] - origin[i]) / direction[i], b = (mesh.geometry.bounds.max[i] - origin[i]) / direction[i];
      near = Math.max(near, Math.min(a, b));
      far = Math.min(far, Math.max(a, b));
    }
  }
  return !(far < near);
}
