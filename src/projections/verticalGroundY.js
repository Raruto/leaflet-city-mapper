/**
 * Invert the vertical camera projection onto the ground, clamping at the far distance.
 *
 * @param {number} y Vertical camera coordinate.
 * @param {number} tilt Cosine of camera pitch.
 * @param {number} distance Camera distance.
 * @param {number} rise Sine of camera pitch.
 * @param {number} far Maximum ground distance.
 *
 * @returns {number} Clamped ground coordinate.
 */
export function verticalGroundY(y, tilt, distance, rise, far) {
  return tilt * distance + rise * y > 0
    ? Math.max(-far, Math.min(far, y * distance / (tilt * distance + rise * y))) : -far;
}
