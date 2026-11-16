import { gridTileLoaded } from './gridTileLoaded.js';

/**
 * Check whether the current grid level still lacks renderable terrain.
 *
 * @param {Object} state Native grid layer state.
 * @param {boolean} includeFade Whether the imagery must also finish fading.
 *
 * @returns {boolean} Whether the current level is incomplete.
 */
export function gridTerrainPending(state, includeFade) {
  const { source } = state;
  let key, tile;
  for (key in source._tiles) {
    tile = source._tiles[key];
    if (tile.coords.z !== source._tileZoom) continue;
    if (!gridTileLoaded(tile) || !state.terrainRequests.get(key)?.tiles) return true;
    if (includeFade && (tile._gpuOpacity ?? 1) < 1) return true;
  }
  return !Object.keys(source._tiles).length;
}
