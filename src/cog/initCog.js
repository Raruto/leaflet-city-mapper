import { initRaster } from '../raster/initRaster.js';
import { openCog } from './openCog.js';

export function initCog(layer, options) {
  initRaster(layer, /* alloc */ { ariaLabel: 'COG raster', ...options,
    archive: options.archive || openCog(/* alloc */ new URL(options.url, document.baseURI).href, options.asset) });
}
