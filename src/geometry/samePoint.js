/**
 * Compare two 2D coordinates with the geometry tolerance.
 *
 * @param {Array<number>} a First coordinate.
 * @param {Array<number>} b Second coordinate.
 *
 * @returns {boolean} Whether both components are within tolerance.
 */
export function samePoint(a, b) {
  return Math.abs(a[0] - b[0]) < 1e-10 && Math.abs(a[1] - b[1]) < 1e-10;
}
