import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrainPromiseByLayer } from '../weakmaps/terrainPromiseByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';




import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';
import { loadReadyTerrain } from './loadReadyTerrain.js';
import { setLayerTerrain } from './setLayerTerrain.js';

export function onTerrainAdd(layer, map) {

  if (terrain3DByMap.get(map) && terrain3DByMap.get(map) !== layer) {
    throw /* alloc */ new Error('Only one terrain layer can be active per map');
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
