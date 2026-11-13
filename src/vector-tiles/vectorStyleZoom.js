import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';

/**
 * Convert map zoom to style zoom using the configured offset.
 *
 * @param {Object} layer Vector tile layer; an offset of -1 maps 256px tiles to 512px style zooms.
 *
 * @returns {number} Style zoom.
 */
export function vectorStyleZoom(layer) {
  return layer._map.getZoom() + (vectorTileOptionsByLayer.get(layer).styleZoomOffset ?? 0);
}
