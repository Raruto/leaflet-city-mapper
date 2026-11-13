import { setRasterOpacity } from './setRasterOpacity.js';

/**
 * Set raster layer opacity and update its existing meshes.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {number} opacity New opacity.
 *
 * @returns {L.Layer} The updated layer.
 */
export function setPMTileOpacity(layer, opacity) {
  layer.options.opacity = opacity;
  setRasterOpacity(layer, opacity);
  return layer;
}
