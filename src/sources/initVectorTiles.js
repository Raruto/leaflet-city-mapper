import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { configureVectorTileLayer } from '../vector-tiles/configureVectorTileLayer.js';
import { readyVectorTiles } from './readyVectorTiles.js';
import { reportError } from '../raster/reportRasterError.js';
import { noOperation } from '../utils/noOperation.js';

/**
 * Configure a vector tile layer asynchronously and report initialization errors.
 *
 * @param {L.Layer} layer Layer to initialize.
 * @param {Object} options Vector tile configuration.
 */
export function initVectorTiles(layer, options) {
  kindByLayer.set(layer, 'pending');
  const ready = configureVectorTileLayer(layer, options)
    .then(readyVectorTiles.bind(null, layer))
    .catch(reportError.bind(null, layer));
  readyByLayer.set(layer, ready);
  ready.catch(noOperation);
}
