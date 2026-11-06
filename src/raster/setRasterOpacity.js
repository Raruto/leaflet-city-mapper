import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';



import { update } from '../scene/update.js';

export function setRasterOpacity(layer, opacity) {
  let tile, terrainMesh;
  for (tile of rasterTilesByLayer.get(layer).values()) {
    if (tile.mesh) tile.mesh.opacity = opacity;
    terrainMesh = rasterTilesByLayer.get(terrain3DByLayer.get(layer)).get(tile);
    if (terrainMesh) terrainMesh.opacity = opacity;
  }
  update(layer);
}
