import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { setRasterTerrain } from '../raster/setRasterTerrain.js';

/**
 * Associate a raster layer with this terrain layer.
 *
 * @param {L.Layer} layer Layer to update if it is raster.
 */
export function setLayerTerrain(layer) {
  if (kindByLayer.get(layer) === 'raster') setRasterTerrain(layer, this);
}
