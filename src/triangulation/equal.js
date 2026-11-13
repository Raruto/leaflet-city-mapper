/**
 * Compare two planar points by exact coordinates.
 *
 * @param {Object} a First point.
 * @param {Object} b Second point.
 *
 * @returns {boolean} Whether both coordinates match.
 */
export function equal(a, b) {
  return a.x === b.x && a.y === b.y;
}
