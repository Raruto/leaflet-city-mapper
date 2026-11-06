import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrainPromiseByLayer } from '../weakmaps/terrainPromiseByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';




import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';
import { loadReadyTerrain } from './loadReadyTerrain.js';
import { setLayerTerrain } from './setLayerTerrain.js';

export function onTerrainAdd(layer, map) {

  if (terrain3DByMap.get(map) && terrain3DByMap.get(map) !== layer) {
    throw /* alloc */ new Error('Only one terrain layer can be active per map');
  }
  mutateWeakMap(terrain3DByMap, map, "=", layer);
  onAdd3DLayer(layer, map);
  if (rootByLayer.get(layer)) mutateWeakMap(terrainPromiseByLayer, layer, "=", loadTerrain(layer));
  else {
    const pending = Promise.withResolvers();
    mutateWeakMap(terrainPromiseByLayer, layer, "=", pending.promise);
    layer.once('ready', loadReadyTerrain, /* alloc */ { backend: layer, ...pending });
  }
  map.eachLayer(setLayerTerrain, layer);
  map.fire('terrainchange');
}
