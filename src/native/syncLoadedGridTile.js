import { syncGridTile } from './syncGridTile.js';
import { syncTerrainGridTile } from './syncTerrainGridTile.js';

/**
 * Synchronize a loaded grid tile and keep finer imagery above coarser imagery.
 *
 * @param {Object} state Native grid layer state.
 * @param {string} key Leaflet tile key.
 * @param {Object} tile Loaded Leaflet grid tile record.
 *
 * @returns {boolean} Whether a new mesh replaced the previous mesh.
 */
export function syncLoadedGridTile(state, key, tile) {
  const opacity = (state.source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
  const previous = state.meshes.get(key);
  const mesh = state.terrainRequests ? syncTerrainGridTile(state, key, tile, opacity)
    : syncGridTile(state, key, tile, opacity);
  if (mesh) mesh.renderOrder += tile.coords.z / 100;
  return Boolean(mesh && mesh !== previous);
}
