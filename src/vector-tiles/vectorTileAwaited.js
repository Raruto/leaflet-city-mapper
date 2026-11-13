import { vectorTileOverlaps } from './vectorTileOverlaps.js';

/**
 * Check whether a stale tile is needed while an overlapping tile is loading.
 *
 * @param {Object} layer Vector tile layer.
 * @param {Object} stale Existing tile.
 *
 * @returns {boolean} Whether a needed overlapping tile has no group yet.
 */
export function vectorTileAwaited(layer, stale) {
  let tile;
  for (tile of layer.tiles.values()) {
    if (tile.needed && !tile.group && vectorTileOverlaps(tile.coords, stale.coords)) return true;
  }
  return false;
}
