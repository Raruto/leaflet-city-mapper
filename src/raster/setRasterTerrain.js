import { pluginState } from '../core/pluginState.js';
import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { registerTerrainTile } from './registerTerrainTile.js';

export function setRasterTerrain(backend, terrain) {
  // Pending sources bind the current terrain when their raster attachment is ready.
  if (!pluginState(backend)._rasterTiles || pluginState(backend)._terrain3D === terrain) return;
  let tile;
  for (tile of pluginState(backend)._rasterTiles.values()) {
    if(pluginState(backend)._terrain3D) removeRasterTile(pluginState(backend)._terrain3D, tile);
    if (tile.mesh) {
      tile.mesh.visible = true;
      setParent(tile.mesh, pluginState(backend).root);
    }
  }
  pluginState(backend)._terrain3D = terrain || null;
  if (terrain) {
    for (tile of pluginState(backend)._rasterTiles.values()) {
      if (tile.done) registerTerrainTile(backend, tile.coords, tile);
    }
  }
}
