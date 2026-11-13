/**
 * Check that XYZ coordinates are safe integers within the supported zoom and tile range.
 *
 * @param {number} z Tile zoom.
 * @param {number} x Tile column.
 * @param {number} y Tile row.
 *
 * @returns {boolean} Whether the coordinates are valid.
 */
export function validCogTileCoordinates(z, x, y) {
  return Number.isSafeInteger(z) && Number.isSafeInteger(x) && Number.isSafeInteger(y) &&
    z >= 0 && z <= 24 && x >= 0 && y >= 0 && x < 2 ** z && y < 2 ** z;
}
