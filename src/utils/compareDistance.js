/**
 * Compare objects by ascending distance.
 *
 * @param {Object} a First object with a distance.
 * @param {Object} b Second object with a distance.
 *
 * @returns {number} Signed distance difference.
 */
export function compareDistance(a, b) {
  return a.distance - b.distance;
}
