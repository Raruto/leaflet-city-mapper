import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';



import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { registerTerrainTile } from './registerTerrainTile.js';

export function setRasterTerrain(layer, terrain) {
  // Pending sources bind the current terrain when their raster attachment is ready.
  if (!rasterTilesByLayer.get(layer) || terrain3DByLayer.get(layer) === terrain) return;
  let tile;
  for (tile of rasterTilesByLayer.get(layer).values()) {
    if(terrain3DByLayer.get(layer)) removeRasterTile(terrain3DByLayer.get(layer), tile);
    if (tile.mesh) {
      tile.mesh.visible = true;
      setParent(tile.mesh, rootByLayer.get(layer));
    }
  }
  terrain3DByLayer.set(layer, terrain || null);
  if (terrain) {
    for (tile of rasterTilesByLayer.get(layer).values()) {
      if (tile.done) registerTerrainTile(layer, tile.coords, tile);
    }
  }
}
