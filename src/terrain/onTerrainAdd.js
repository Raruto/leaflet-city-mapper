import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from '../raster/setRasterTerrain.js';
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';
import { loadReadyTerrain } from './loadReadyTerrain.js';
import { setLayerTerrain } from './setLayerTerrain.js';

export function onTerrainAdd(backend, map) {
  if (cameraByMap.get(map)._terrain3D && cameraByMap.get(map)._terrain3D !== backend) {
    throw /* alloc */ new Error('Only one terrain layer can be active per map');
  }
  cameraByMap.get(map)._terrain3D = backend;
  onAdd3DLayer(backend, map);
  if (sceneByLayer.get(backend).root) sceneByLayer.get(backend)._terrainPromise = loadTerrain(backend);
  else {
    const pending = Promise.withResolvers();
    sceneByLayer.get(backend)._terrainPromise = pending.promise;
    backend.once('ready', loadReadyTerrain, /* alloc */ { backend, ...pending });
  }
  map.eachLayer(setLayerTerrain, backend);
  map.fire('terrainchange');
}
