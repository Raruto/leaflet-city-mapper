import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';

/**
 * Check whether a raster layer has tile loads in progress.
 *
 * @param {L.Layer} layer Raster layer.
 *
 * @returns {boolean} Whether at least one tile is loading.
 */
export function isLoading(layer) {
  return loadingTilesByLayer.get(layer) > 0;
}
