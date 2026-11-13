/**
 * Order roof tiles by layer z-index and then tile zoom.
 *
 * @param {Object} a First tile and layer entry.
 * @param {Object} b Second tile and layer entry.
 *
 * @returns {number} Sort comparison.
 */
export function compareRoofTiles(a, b) {
  return (a.layer.options.zIndex || 0) - (b.layer.options.zIndex || 0) ||
    a.tile.coords.z - b.tile.coords.z;
}
