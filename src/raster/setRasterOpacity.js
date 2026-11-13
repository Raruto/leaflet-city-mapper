import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/**
 * Update opacity on the layer's raster and terrain meshes.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {number} opacity New opacity.
 */
export function setRasterOpacity(layer, opacity) {
  let tile, terrainMesh;
  for (tile of rasterTilesByLayer.get(layer).values()) {
    if (tile.mesh) tile.mesh.opacity = opacity;
    terrainMesh = rasterTilesByLayer.get(terrain3DByLayer.get(layer))?.get(tile);
    if (terrainMesh) terrainMesh.opacity = opacity;
  }
  update(layer);
}
