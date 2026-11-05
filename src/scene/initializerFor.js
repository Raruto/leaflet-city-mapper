import { initializeGeoJSON } from '../sources/initializeGeoJSON.js';
import { initRaster } from '../raster/initRaster.js';
import { initTerrain } from '../terrain/initTerrain.js';
import { initTraffic } from '../traffic/initTraffic.js';
import { initCog } from '../cog/initCog.js';

export function initializerFor(type) {
  switch (type) {
    case 'geojson': return initializeGeoJSON;
    case 'pmtiles': return initRaster;
    case 'cog': return initCog;
    case 'terrain': return initTerrain;
    case 'traffic': return initTraffic;
    default: return null;
  }
}
