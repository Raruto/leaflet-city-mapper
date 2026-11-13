import { equal } from './equal.js';
import { cross } from './cross.js';

/**
 * Check whether a polygon has another vertex inside or on a counterclockwise triangle.
 *
 * @param {Object[]} polygon Planar polygon vertices.
 * @param {Object} a First triangle vertex.
 * @param {Object} b Second triangle vertex.
 * @param {Object} c Third triangle vertex.
 *
 * @returns {boolean} Whether a distinct polygon vertex is contained.
 */
export function containsVertex(polygon, a, b, c) {
  let p;
  for (p of polygon) {
    if (!equal(p, a) && !equal(p, b) && !equal(p, c) &&
      cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) return true;
  }
  return false;
}
