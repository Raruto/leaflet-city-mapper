/**
 * Read the projected point's ground offset, defaulting to zero.
 *
 * @param {Object} point Projected point.
 *
 * @returns {number} Ground offset.
 */
export function groundOffset(point) {
  return point.ground || 0;
}
