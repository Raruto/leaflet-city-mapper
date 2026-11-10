import { coreWhite } from '../globals/coreWhite.js';
import { loadGridTerrain } from './loadGridTerrain.js';
import { styleNativeMesh } from './styleNativeMesh.js';
import { terrainGridMesh } from './terrainGridMesh.js';

export function syncTerrainGridTile(state, key, tile, opacity) {
  const retained = state.textures.get(key), mesh = state.meshes.get(key);
  let request = state.terrainRequests.get(key);
  if (!request || request.tile !== tile) {
    request = /* alloc */ { tile, stream: state.terrainStream };
    state.terrainRequests.set(key, request);
    loadGridTerrain(state, key, tile, request);
  }
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
