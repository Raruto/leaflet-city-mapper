import './pmtiles.js';
import { removeRasterTile } from '../utils/removeRasterTile.js';
import { elevationWGSL } from '../utils/elevationWGSL.js';
import { onTerrainRemove } from '../utils/onTerrainRemove.js';
import { onTerrainAdd } from '../utils/onTerrainAdd.js';

/**
 * Renders IGN Float32 DEM tiles and PMTiles raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles DEM); `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 */
L.Layer.types.terrain = (layer, options) => {
  const terrainSource = options.url;
  const layerOptions = { ...options };
  delete layerOptions.url;
  L.Layer.types['3d'](layer, layerOptions);
  layer.terrainSource = terrainSource;
  layer._terrainTiles = new Map();
  layer._rasterTiles = new Map();
  layer._terrainReady = false;
  layer.onAdd = map => onTerrainAdd(layer, map);
  layer.onRemove = map => onTerrainRemove(layer, map);
};

L.Layer.types.terrain.elevationWGSL = elevationWGSL;