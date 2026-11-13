import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/**
 * Update rendering order on the layer's raster and terrain meshes.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {number} zIndex New rendering order.
 */
export function setRasterZIndex(layer, zIndex) {
  let tile, terrainMesh;
  for (tile of rasterTilesByLayer.get(layer).values()) {
    if (tile.mesh) tile.mesh.renderOrder = zIndex;
    terrainMesh = rasterTilesByLayer.get(terrain3DByLayer.get(layer))?.get(tile);
    if (terrainMesh) terrainMesh.renderOrder = zIndex;
  }
  update(layer);
}
