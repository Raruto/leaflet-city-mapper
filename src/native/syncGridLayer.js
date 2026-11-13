import { prepareGridTerrainRequests } from './prepareGridTerrainRequests.js';
import { syncGridTile } from './syncGridTile.js';
import { syncTerrainGridTile } from './syncTerrainGridTile.js';
import { retainGridTerrain } from './retainGridTerrain.js';

/**
 * Synchronize loaded grid tiles and retain terrain while replacements are pending.
 *
 * @param {Object} state Native grid layer state.
 */
export function syncGridLayer(state) {
  const { source } = state;
  const stream = prepareGridTerrainRequests(state);
  let key, tile, opacity, mesh, pending = false;
  for (key in source._tiles) {
    if (!Object.hasOwn(source._tiles, key)) continue;
    tile = source._tiles[key];
    if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) {
      pending = Boolean(stream);
      continue;
    }
    opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
    mesh = state.terrainRequests ? syncTerrainGridTile(state, key, tile, opacity)
      : syncGridTile(state, key, tile, opacity);
    if (state.terrainRequests && !state.terrainRequests.get(key).tiles) pending = true;
    if (mesh) mesh.renderOrder += tile.coords.z / 100;
  }
  if (stream && (pending || !Object.keys(source._tiles).length)) {
    retainGridTerrain(state);
  }
}
