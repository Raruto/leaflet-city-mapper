import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainSourceByLayer } from '../weakmaps/terrainSourceByLayer.js';
import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



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
  mutateWeakMap(terrainSourceByLayer, layer, "=", terrainSource);
  mutateWeakMap(terrainTilesByLayer, layer, "=", /* alloc */ new Map());
  mutateWeakMap(rasterTilesByLayer, layer, "=", /* alloc */ new Map());
  mutateWeakMap(terrainReadyByLayer, layer, "=", false);
  mutateWeakMap(kindByLayer, layer, "=", 'terrain');
}
