import { prepareGridTerrainRequests } from './prepareGridTerrainRequests.js';
import { syncGridTile } from './syncGridTile.js';
import { syncTerrainGridTile } from './syncTerrainGridTile.js';
import { retainGridTerrain } from './retainGridTerrain.js';

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
  let key, tile, opacity, mesh, previous, pending = false, transitioning = false, changed = false;
  if (stream) {
    for (mesh of state.meshes.values()) {
      if (mesh._terrainRequest && mesh._terrainRequest.tile.coords.z !== source._tileZoom) transitioning = true;
    }
    for (key in source._tiles) {
      tile = source._tiles[key];
      if (tile.coords.z !== source._tileZoom) continue;
      if (!tile.loaded || (tile._gpuOpacity ?? 1) < 1 || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth ||
          !state.terrainRequests.get(key)?.tiles) pending = true;
    }
    if (transitioning && pending) {
      retainGridTerrain(state);
      return false;
    }
  }
  for (key in source._tiles) {
    if (!Object.hasOwn(source._tiles, key)) continue;
    tile = source._tiles[key];
    if (stream && tile.coords.z !== source._tileZoom) continue;
    if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) {
      pending ||= Boolean(stream);
      continue;
    }
    opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
    previous = state.meshes.get(key);
    mesh = state.terrainRequests ? syncTerrainGridTile(state, key, tile, opacity)
      : syncGridTile(state, key, tile, opacity);
    if (state.terrainRequests && !state.terrainRequests.get(key).tiles) pending = true;
    if (mesh) mesh.renderOrder += tile.coords.z / 100;
    if (stream && mesh && mesh !== previous) changed = true;
  }
  if (stream && (pending || !Object.keys(source._tiles).length)) {
    retainGridTerrain(state);
  }
  return changed;
}
