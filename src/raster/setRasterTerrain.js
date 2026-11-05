import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { registerTerrainTile } from './registerTerrainTile.js';

export function setRasterTerrain(backend, terrain) {
  if (backend._terrain3D === terrain) return;
  let tile;
  for (tile of backend._rasterTiles.values()) {
    if(backend._terrain3D) removeRasterTile(backend._terrain3D, tile);
    if (tile.mesh) {
      tile.mesh.visible = true;
      setParent(tile.mesh, backend.root);
    }
  }
  backend._terrain3D = terrain || null;
  if (terrain) {
    for (tile of backend._rasterTiles.values()) {
      if (tile.done) registerTerrainTile(backend, tile.coords, tile);
    }
  }
}
