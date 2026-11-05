import { pluginState } from '../core/pluginState.js';
import { update } from '../scene/update.js';

export function setRasterZIndex(backend, zIndex) {
  let tile, terrainMesh;
  for (tile of pluginState(backend)._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.renderOrder = zIndex;
    terrainMesh = pluginState(pluginState(backend)._terrain3D)?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.renderOrder = zIndex;
  }
  update(backend);
}
