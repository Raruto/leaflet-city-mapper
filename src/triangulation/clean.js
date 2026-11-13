import { cross } from './cross.js';
import { equal } from './equal.js';

/**
 * Remove duplicate and collinear vertices in place while preserving at least three points.
 *
 * @param {Object[]} ring Planar vertices to clean.
 *
 * @returns {Object[]} The supplied ring.
 *
 * @throws {Error} If the ring has fewer than three vertices.
 */
export function clean(ring) {
  let changed = true;
  let i, a, b, c;
  while (changed && ring.length > 3) {
    changed = false;
    for (i = 0; i < ring.length; i++) {
      a = ring[(i + ring.length - 1) % ring.length], b = ring[i], c = ring[(i + 1) % ring.length];
      if (equal(a, b) || Math.abs(cross(a, b, c)) < 1e-10) {
        ring.splice(i, 1); changed = true; break;
      }
    }
  }
  if (ring.length < 3) throw /* alloc */ new Error('Degenerate polygon ring');
  return ring;
}
