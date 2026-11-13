

/**
 * Order pending tiles by zoom and then distance from the map center.
 *
 * @param {Object} a First pending tile entry.
 * @param {Object} b Second pending tile entry.
 *
 * @returns {number} Sort comparison.
 */
export function comparePendingTiles(a, b) {
  return a.tile.coords.z - b.tile.coords.z || a.distance - b.distance;
}
