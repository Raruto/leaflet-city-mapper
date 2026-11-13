import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrainRequestByLayer } from '../weakmaps/terrainRequestByLayer.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/**
 * Remove a raster tile's terrain mesh and abort the terrain request.
 *
 * @param {L.Layer} layer Terrain layer.
 * @param {Object} tile Raster tile used as the mesh key.
 */
export function removeRasterTile(layer, tile) {
  terrainRequestByLayer.get(layer)?.abort();
  const mesh = rasterTilesByLayer.get(layer).get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(layer);
  if (mesh.texture !== tile.texture) destroyTexture(layer, mesh.texture.texture);
  rasterTilesByLayer.get(layer).delete(tile);
}
