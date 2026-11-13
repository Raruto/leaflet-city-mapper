import { crossesRing } from './crossesRing.js';

/**
 * Test a segment against the current polygon and each hole boundary.
 *
 * @param {Object} a First segment endpoint.
 * @param {Object} b Second segment endpoint.
 * @param {Object[]} polygon Current polygon vertices.
 * @param {Object[][]} rings Outer ring followed by hole rings.
 *
 * @returns {boolean} Whether the segment intersects a boundary.
 */
export function crossesBoundary(a, b, polygon, rings) {
  if (crossesRing(a, b, polygon)) return true;
  let i;
  for (i = 1; i < rings.length; i++) if (crossesRing(a, b, rings[i])) return true;
  return false;
}
