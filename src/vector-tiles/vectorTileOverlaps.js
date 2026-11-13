/**
 * Check whether two tile coordinates overlap across zoom levels.
 *
 * @param {Object} a First tile coordinates.
 * @param {Object} b Second tile coordinates.
 *
 * @returns {boolean} Whether the tiles overlap.
 */
export function vectorTileOverlaps(a, b) {
  const shift = a.z - b.z;
  return shift >= 0 ? a.x >> shift === b.x && a.y >> shift === b.y : b.x >> -shift === a.x && b.y >> -shift === a.y;
}
