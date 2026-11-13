import { setRasterZIndex } from './setRasterZIndex.js';

/**
 * Set raster layer z-index and update its existing meshes.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {number} zIndex New rendering order.
 *
 * @returns {L.Layer} The updated layer.
 */
export function setPMTileZIndex(layer, zIndex) {
  layer.options.zIndex = zIndex;
  setRasterZIndex(layer, zIndex);
  return layer;
}
