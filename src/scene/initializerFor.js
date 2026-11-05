import { initializeGeoJSON } from '../sources/initializeGeoJSON.js';
import { initRaster } from '../raster/initRaster.js';
import { initTerrain } from '../terrain/initTerrain.js';
import { initTraffic } from '../traffic/initTraffic.js';

export function initializerFor(type) {
  switch (type) {
    case 'geojson': return initializeGeoJSON;
    case 'pmtiles': return initRaster;
    case 'terrain': return initTerrain;
    case 'traffic': return initTraffic;
    default: throw /* allocation: required -- Preserve the failure stack for invalid source types. */ new Error(`Unknown layer type: ${type}`);
  }
}
