/**
 * Check every component of a tile coordinate for finiteness.
 *
 * @param {Array<number>} point Tile coordinate.
 *
 * @returns {boolean} Whether all components are finite.
 */
export function finiteMvtCoordinate(point) {
  let i = 0;
  for (; i < point.length; i++) {
    if (!Number.isFinite(point[i])) return false;
  }
  return true;
}
