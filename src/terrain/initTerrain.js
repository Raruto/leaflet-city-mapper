import { pluginState } from '../core/pluginState.js';
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
  delete pluginState(layerOptions).url;
  init3D(layer, layerOptions);
  pluginState(layer).terrainSource = terrainSource;
  pluginState(layer)._terrainTiles = /* allocation: required -- Each terrain layer retains its own decoded DEM tiles. */ new Map();
  pluginState(layer)._rasterTiles = /* allocation: required -- Each terrain layer owns its independently removable displaced raster meshes. */ new Map();
  pluginState(layer)._terrainReady = false;
  pluginState(layer).onAdd = onTerrainAdd.bind(null, layer);
  pluginState(layer).onRemove = onTerrainRemove.bind(null, layer);
}
