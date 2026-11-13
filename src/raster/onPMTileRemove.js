import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';
import { releaseRasterTiles } from './releaseRasterTiles.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';

/**
 * Release raster tiles and detach the layer from terrain and the 3D scene.
 *
 * @param {L.Layer} layer Raster layer being removed.
 * @param {L.Map} map Map containing the layer.
 */
export function onPMTileRemove(layer, map) {
  releaseRasterTiles(layer);
  terrain3DByLayer.set(layer, null);
  onRemove3DLayer(layer, map);
}
