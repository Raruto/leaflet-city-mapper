import { equal } from './equal.js';
import { cross } from './cross.js';
import { on } from './on.js';

/**
 * Test two segments for intersection, excluding shared endpoints.
 *
 * @param {Object} a First endpoint of the first segment.
 * @param {Object} b Second endpoint of the first segment.
 * @param {Object} c First endpoint of the second segment.
 * @param {Object} d Second endpoint of the second segment.
 *
 * @returns {boolean} Whether the segments intersect.
 */
export function intersects(a, b, c, d) {
  if (equal(a, c) || equal(a, d) || equal(b, c) || equal(b, d)) return false;
  const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
  return abC * abD < 0 && cdA * cdB < 0 ||
    abC === 0 && on(a, b, c) || abD === 0 && on(a, b, d) ||
    cdA === 0 && on(c, d, a) || cdB === 0 && on(c, d, b);
}
