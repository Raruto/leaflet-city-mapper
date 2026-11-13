import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { setRasterTerrain } from '../raster/setRasterTerrain.js';

/**
 * Clear a raster layer's terrain association.
 *
 * @param {L.Layer} layer Layer to update if it is raster.
 */
export function clearLayerTerrain(layer) {
  if (kindByLayer.get(layer) === 'raster') setRasterTerrain(layer, null);
}
