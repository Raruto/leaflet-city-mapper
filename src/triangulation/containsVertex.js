import { equal } from './equal.js';
import { cross } from './cross.js';

export function containsVertex(polygon, a, b, c) {
  let p;
  for (p of polygon) {
    if (!equal(p, a) && !equal(p, b) && !equal(p, c) &&
      cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) return true;
  }
  return false;
}
