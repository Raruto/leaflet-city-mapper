import { pluginState } from '../core/pluginState.js';
import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';
import { loadReadyTerrain } from './loadReadyTerrain.js';
import { setLayerTerrain } from './setLayerTerrain.js';

export function onTerrainAdd(backend, map) {
  if (pluginState(map)._terrain3D && pluginState(map)._terrain3D !== backend) {
    throw /* allocation: required -- Each reported failure needs its own message and stack for the receiving caller or event listener. */ new Error('Only one terrain layer can be active per map');
  }
  pluginState(map)._terrain3D = backend;
  onAdd3DLayer(backend, map);
  if (pluginState(backend).root) pluginState(backend)._terrainPromise = loadTerrain(backend);
  else {
    const pending = Promise.withResolvers();
    pluginState(backend)._terrainPromise = pending.promise;
    backend.once('ready', loadReadyTerrain, /* allocation: required -- The ready listener retains this layer’s promise resolvers until initialization completes. */ { backend, ...pending });
  }
  map.eachLayer(setLayerTerrain, backend);
  map.fire('terrainchange');
}
