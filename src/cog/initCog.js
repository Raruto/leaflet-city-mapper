import { initRaster } from '../raster/initRaster.js';
import { openCogInWorker } from '../workers/openCogInWorker.js';

/**
 * Initialize a raster layer backed by a COG archive or a worker-opened COG source.
 *
 * @param {L.Layer} layer Raster layer to initialize.
 * @param {Object} options Layer and COG source options.
 */
export function initCog(layer, options) {
  initRaster(layer, /* alloc */ { ariaLabel: 'COG raster', ...options,
    archive: options.archive || openCogInWorker(layer, options) });
}
