import { initRaster } from '../raster/initRaster.js';
import { openCogInWorker } from '../workers/openCogInWorker.js';

export function initCog(layer, options) {
  initRaster(layer, /* alloc */ { ariaLabel: 'COG raster', ...options,
    archive: options.archive || openCogInWorker(layer, options) });
}
