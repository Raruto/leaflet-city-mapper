import { sceneByLayer } from '../globals/sceneByLayer.js';


import { onTerrainRemove } from './onTerrainRemove.js';
import { onTerrainAdd } from './onTerrainAdd.js';
import { init3D } from '../scene/init3D.js';

/**
 * Renders IGN Float32 DEM tiles and PMTiles raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles DEM); `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 */
export function initTerrain(layer, options) {
  const terrainSource = options.url;
  const layerOptions = /* allocation: required -- Layer initialization retains its own options without mutating the caller’s terrain-source options. */ { ...options };
  delete layerOptions.url;
  init3D(layer, layerOptions);
  sceneByLayer.get(layer).terrainSource = terrainSource;
  sceneByLayer.get(layer)._terrainTiles = /* allocation: required -- Each terrain layer retains its own decoded DEM tiles. */ new Map();
  sceneByLayer.get(layer)._rasterTiles = /* allocation: required -- Each terrain layer owns its independently removable displaced raster meshes. */ new Map();
  sceneByLayer.get(layer)._terrainReady = false;
  sceneByLayer.get(layer).kind = 'terrain';
}
