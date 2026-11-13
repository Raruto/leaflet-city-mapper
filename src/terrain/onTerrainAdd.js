import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrainPromiseByLayer } from '../weakmaps/terrainPromiseByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { streamTerrainByLayer } from '../weakmaps/streamTerrainByLayer.js';
import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';
import { loadReadyTerrain } from './loadReadyTerrain.js';
import { setLayerTerrain } from './setLayerTerrain.js';

/**
 * Attach archive or streamed terrain to a map and start loading when needed.
 *
 * @param {L.Layer} layer Terrain layer.
 * @param {L.Map} map Map receiving the terrain.
 *
 * @throws {Error} If another terrain layer is already active on the map.
 */
export function onTerrainAdd(layer, map) {

  if (streamTerrainByMap.get(map) || terrain3DByMap.get(map) && terrain3DByMap.get(map) !== layer) {
    throw /* alloc */ new Error('Only one terrain layer can be active per map');
  }
  if (streamTerrainByLayer.get(layer)) {
    streamTerrainByMap.set(map, /* alloc */ {
      layer, map, terrainCache: /* alloc */ new Map(), terrainController: /* alloc */ new AbortController(),
    });
    onAdd3DLayer(layer, map);
    map.fire('terrainchange');
    return;
  }
  terrain3DByMap.set(map, layer);
  onAdd3DLayer(layer, map);
  if (rootByLayer.get(layer)) terrainPromiseByLayer.set(layer, loadTerrain(layer));
  else {
    const pending = Promise.withResolvers();
    terrainPromiseByLayer.set(layer, pending.promise);
    layer.once('ready', loadReadyTerrain, /* alloc */ { backend: layer, ...pending });
  }
  map.eachLayer(setLayerTerrain, layer);
  map.fire('terrainchange');
}
