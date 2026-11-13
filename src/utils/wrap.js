/**
 * Wrap an angle to the range from negative pi to pi.
 *
 * @param {number} angle Angle in radians.
 *
 * @returns {number} Wrapped angle in radians.
 */
export function wrap(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
