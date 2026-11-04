import { onTerrainRemove } from './onTerrainRemove.js';
import { onTerrainAdd } from './onTerrainAdd.js';
import { init3D } from '../scene/init3D.js';

/**
 * Renders IGN Float32 DEM tiles and PMTiles raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles DEM); `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 */
export function initTerrain(layer, options) {
  const terrainSource = options.url;
  const layerOptions = { ...options };
  delete layerOptions.url;
  init3D(layer, layerOptions);
  layer.terrainSource = terrainSource;
  layer._terrainTiles = new Map();
  layer._rasterTiles = new Map();
  layer._terrainReady = false;
  layer.onAdd = map => onTerrainAdd(layer, map);
  layer.onRemove = map => onTerrainRemove(layer, map);
}
