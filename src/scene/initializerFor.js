import { initRaster } from '../raster/initRaster.js';
import { initTerrain } from '../terrain/initTerrain.js';
import { initTraffic } from '../traffic/initTraffic.js';
import { initCog } from '../cog/initCog.js';

export function initializerFor(type, options = {}) {
  switch (type) {
    case 'raster': return options.asset !== undefined || /\.tiff?(?:[?#]|$)/i.test(options.url)
      ? initCog : initRaster;
    case 'terrain': return initTerrain;
    case 'traffic': return initTraffic;
    default: return null;
  }
}
