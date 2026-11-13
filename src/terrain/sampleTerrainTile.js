/**
 * Sample one integer pixel from the terrain tile map.
 *
 * @param {Map} tiles DEM tiles keyed by x/y.
 * @param {number} px Global pixel x coordinate.
 * @param {number} py Global pixel y coordinate.
 *
 * @returns {number|null} Elevation, or null for a missing or invalid sample.
 */
export function sample(tiles, px, py) {
  const tileX = Math.floor(px / 256), tileY = Math.floor(py / 256);
  const tile = tiles.get(`${tileX}/${tileY}`);
  if (!tile) return null;
  const elevation = tile[(py - tileY * 256) * 256 + px - tileX * 256];
  return Number.isFinite(elevation) && elevation > -1000 ? elevation : null;
}
