/**
 * Check whether a native grid tile has loaded renderable content.
 *
 * @param {Object} tile Leaflet grid tile record.
 *
 * @returns {boolean} Whether the tile can be synchronized.
 */
export function gridTileLoaded(tile) {
  return Boolean(tile.loaded && (!(tile.el instanceof HTMLImageElement) || tile.el.naturalWidth));
}
