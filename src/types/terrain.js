import './pmtiles.js';
import { removeRasterTile } from '../utils/removeRasterTile.js';
import { elevationWGSL } from '../utils/elevationWGSL.js';
import { addRasterTile } from '../utils/addRasterTile.js';
import { getElevation } from '../utils/getElevation.js';
import { onTerrainRemove } from '../utils/onTerrainRemove.js';
import { onTerrainAdd } from '../utils/onTerrainAdd.js';
import { initTerrain } from '../utils/initTerrain.js';

/**
 * Renders IGN Float32 DEM tiles and PMTiles raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles DEM); `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 */
L.Layer.types.terrain = L.Layer.types['3d'].extend({
  initialize(options = {})           { return initTerrain(this, options); },
  onAdd(map)                         { return onTerrainAdd(this, map); },
  onRemove(map)                      { return onTerrainRemove(this, map); },
  _getElevation(location)            { return getElevation(this, location); },
  addRasterTile(layer, coords, tile) { return addRasterTile(this, layer, coords, tile); },
  removeRasterTile(tile)             { return removeRasterTile(this, tile); },
});

L.Layer.types.terrain.elevationWGSL = elevationWGSL;