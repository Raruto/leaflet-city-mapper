import './3d.js';
import './pmtiles.js';
import { removeRasterTile } from '../utils/removeRasterTile.js';
import { elevationWGSL } from '../utils/elevationWGSL.js';
import { addRasterTile } from '../utils/addRasterTile.js';
import { _addBridges } from '../utils/_addBridges.js';
import { _getElevation } from '../utils/_getElevation.js';
import { _loadTerrain } from '../utils/_loadTerrain.js';
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
  _loadTerrain()                     { return _loadTerrain(this); },
  _getElevation(location)            { return _getElevation(this, location); },
  _addBridges(geojson)               { return _addBridges(this, geojson); },
  addRasterTile(layer, coords, tile) { return addRasterTile(this, layer, coords, tile); },
  removeRasterTile(tile)             { return removeRasterTile(this, tile); },
});

L.Layer.types.terrain.elevationWGSL = elevationWGSL;