import { intersects } from './intersects.js';

/**
 * Test a segment against all edges of a closed ring.
 *
 * @param {Object} a First segment endpoint.
 * @param {Object} b Second segment endpoint.
 * @param {Object[]} ring Planar ring vertices.
 *
 * @returns {boolean} Whether the segment intersects a ring edge away from shared endpoints.
 */
export function crossesRing(a, b, ring) {
  let i;
  for (i = 0; i < ring.length; i++) {
    if (intersects(a, b, ring[i], ring[(i + 1) % ring.length])) return true;
  }
  return false;
}
