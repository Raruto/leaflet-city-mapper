import { inside } from './inside.js';

/**
 * Test whether a point is inside any hole ring.
 *
 * @param {Object} point Point with x and y coordinates.
 * @param {Object[][]} rings Outer ring followed by hole rings.
 *
 * @returns {boolean} Whether the point is inside a hole.
 */
export function insideHole(point, rings) {
  let i;
  for (i = 1; i < rings.length; i++) if (inside(point, rings[i])) return true;
  return false;
}
