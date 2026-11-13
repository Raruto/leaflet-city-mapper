import { L } from '../globals/L.js';
import { coreWhite } from '../globals/coreWhite.js';
import { styleNativeMesh } from './styleNativeMesh.js';
import { quadNativeMesh } from './quadNativeMesh.js';
import { boundsQuad } from '../geometry/boundsQuad.js';

/**
 * Reuse or rebuild the textured mesh for a loaded grid tile.
 *
 * @param {Object} state Native grid layer state.
 * @param {string} key Tile key.
 * @param {Object} tile Loaded tile.
 * @param {number} opacity Tile opacity.
 *
 * @returns {Object|undefined} Tile mesh, if available.
 */
export function syncGridTile(state, key, tile, opacity) {
  const retained = state.textures.get(key), mesh = state.meshes.get(key);
  if (mesh && !mesh._terrainRequest && retained?.image === tile.el &&
    retained.url === (tile.el.currentSrc || tile.el.src)) {
    retained.used = true;
    styleNativeMesh(state, mesh, coreWhite, opacity);
    return mesh;
  }
  const [nw, se] = state.source._tileCoordsToNwSe(tile.coords);
  return quadNativeMesh(state, key, tile.el,
    boundsQuad(state, /* alloc */ new L.LatLngBounds(nw, se)), opacity);
}
