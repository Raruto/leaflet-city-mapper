import { sceneByLayer } from '../globals/sceneByLayer.js';


import { onTerrainRemove } from './onTerrainRemove.js';
import { onTerrainAdd } from './onTerrainAdd.js';
import { init3D } from '../scene/init3D.js';

/**
 * Renders Float32 DEM tiles and archived raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles or supported COG DEM);
 * `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 */
export function initTerrain(layer, options) {
  const terrainSource = options.url;
  const layerOptions = /* alloc */ { ...options };
  delete layerOptions.url;
  init3D(layer, layerOptions);
  sceneByLayer.get(layer).terrainSource = terrainSource;
  sceneByLayer.get(layer)._terrainTiles = /* alloc */ new Map();
  sceneByLayer.get(layer)._rasterTiles = /* alloc */ new Map();
  sceneByLayer.get(layer)._terrainReady = false;
  sceneByLayer.get(layer).kind = 'terrain';
}
