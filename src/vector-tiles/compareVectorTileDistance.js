/**
 * Order vector tiles by ascending distance.
 *
 * @param {Object} a First tile.
 * @param {Object} b Second tile.
 *
 * @returns {number} Relative order of the tiles.
 */
export function compareVectorTileDistance(a, b) {
  return a.distance - b.distance;
}
