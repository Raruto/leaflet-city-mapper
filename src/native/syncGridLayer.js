import { prepareGridTerrainRequests } from './prepareGridTerrainRequests.js';
import { retainGridTerrain } from './retainGridTerrain.js';
import { gridTileLoaded } from './gridTileLoaded.js';
import { gridTerrainPending } from './gridTerrainPending.js';
import { gridTerrainTransition } from './gridTerrainTransition.js';
import { syncLoadedGridTile } from './syncLoadedGridTile.js';

/**
 * Synchronize loaded grid tiles and retain terrain while replacements are pending.
 *
 * @param {Object} state Native grid layer state.
 *
 * @returns {boolean} Whether a new terrain surface was installed.
 */
export function syncGridLayer(state) {
  const { source } = state;
  const stream = prepareGridTerrainRequests(state);
  let key, tile, changed = false;
  if (stream && gridTerrainTransition(state) && gridTerrainPending(state, true)) {
    retainGridTerrain(state);
    return false;
  }
  for (key in source._tiles) {
    if (!Object.hasOwn(source._tiles, key)) continue;
    tile = source._tiles[key];
    if (stream && tile.coords.z !== source._tileZoom) continue;
    if (!gridTileLoaded(tile)) continue;
    if (syncLoadedGridTile(state, key, tile) && stream) changed = true;
  }
  if (stream && gridTerrainPending(state, false)) {
    retainGridTerrain(state);
  }
  return changed;
}
