import { coreWhite } from '../globals/coreWhite.js';
import { styleNativeMesh } from './styleNativeMesh.js';
import { terrainGridMesh } from './terrainGridMesh.js';

/**
 * Request terrain for a grid tile and reuse or build its draped mesh.
 *
 * @param {Object} state Native grid layer state.
 * @param {string} key Tile key.
 * @param {Object} tile Loaded tile.
 * @param {number} opacity Tile opacity.
 *
 * @returns {Object|null|undefined} Mesh when available, otherwise null or undefined.
 */
export function syncTerrainGridTile(state, key, tile, opacity) {
  const retained = state.textures.get(key), mesh = state.meshes.get(key);
  const request = state.terrainRequests.get(key);
  if (!request.tiles) {
    if (mesh && retained?.image === tile.el) {
      retained.used = true;
      styleNativeMesh(state, mesh, coreWhite, opacity);
    }
    return null;
  }
  if (mesh && mesh._terrainRequest === request && retained?.image === tile.el &&
    retained.url === (tile.el.currentSrc || tile.el.src)) {
    retained.used = true;
    styleNativeMesh(state, mesh, coreWhite, opacity);
    return mesh;
  }
  return terrainGridMesh(state, key, tile, request, opacity);
}
