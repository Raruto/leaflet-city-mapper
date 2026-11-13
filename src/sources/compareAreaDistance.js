/**
 * Order area coordinates by their distance from the view center.
 *
 * @param {Object} a First area coordinates.
 * @param {Object} b Second area coordinates.
 *
 * @returns {number} Sort comparison.
 */
export function compareAreaDistance(a, b) {
  return a.distance - b.distance;
}
