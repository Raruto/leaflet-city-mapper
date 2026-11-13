import { initRaster } from '../raster/initRaster.js';
import { initTerrain } from '../terrain/initTerrain.js';
import { initTraffic } from '../traffic/initTraffic.js';
import { initCog } from '../cog/initCog.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';

/**
 * Select the initializer for a non-vector source type.
 *
 * @param {string} type Source type.
 * @param {Object} [options] Source options used to distinguish COG from archive rasters.
 *
 * @returns {Function|null} Initializer, or null for an unknown type.
 */
export function initializerFor(type, options = sceneEmptyOptions) {
  switch (type) {
    case 'raster': return options.asset !== undefined || /\.tiff?(?:[?#]|$)/i.test(options.url)
      ? initCog : initRaster;
    case 'terrain': return initTerrain;
    case 'traffic': return initTraffic;
    default: return null;
  }
}
