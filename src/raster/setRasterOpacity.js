import { pluginState } from '../core/pluginState.js';
import { update } from '../scene/update.js';

export function setRasterOpacity(backend, opacity) {
  let tile, terrainMesh;
  for (tile of pluginState(backend)._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.opacity = opacity;
    terrainMesh = pluginState(pluginState(backend)._terrain3D)?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.opacity = opacity;
  }
  update(backend);
}
