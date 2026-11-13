import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainSourceByLayer } from '../weakmaps/terrainSourceByLayer.js';
import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';
import { streamTerrainByLayer } from '../weakmaps/streamTerrainByLayer.js';
import { onTerrainRemove } from './onTerrainRemove.js';
import { onTerrainAdd } from './onTerrainAdd.js';
import { init3D } from '../scene/init3D.js';

/**
 * Renders Float32 DEM tiles and archived raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles or supported COG DEM),
 * or `getTile(z, x, y, signal)` for streamed 256px Float32 elevations;
 * `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 *
 * @param {L.Layer} layer Terrain layer to initialize.
 * @param {Object} options Terrain and rendering options.
 *
 * @throws {Error} If getTile is supplied but is not a function.
 */
export function initTerrain(layer, options) {
  if (options.getTile !== undefined && typeof options.getTile !== 'function') {
    throw /* alloc */ new Error('Streamed terrain requires a getTile function');
  }
  const terrainSource = options.url;
  const layerOptions = /* alloc */ { ...options };
  delete layerOptions.url;
  init3D(layer, layerOptions);
  terrainSourceByLayer.set(layer, terrainSource);
  terrainTilesByLayer.set(layer, /* alloc */ new Map());
  rasterTilesByLayer.set(layer, /* alloc */ new Map());
  terrainReadyByLayer.set(layer, false);
  if (options.getTile) streamTerrainByLayer.set(layer, true);
  kindByLayer.set(layer, 'terrain');
}
