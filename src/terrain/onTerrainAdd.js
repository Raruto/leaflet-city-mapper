import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from '../pmtiles/setRasterTerrain.js';
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';
import { loadReadyTerrain } from './loadReadyTerrain.js';
import { setLayerTerrain } from './setLayerTerrain.js';

export function onTerrainAdd(backend, map) {
  if (map._terrain3D && map._terrain3D !== backend) {
    throw new Error('Only one terrain layer can be active per map');
  }
  map._terrain3D = backend;
  onAdd3DLayer(backend, map);
  if (backend.root) backend._terrainPromise = loadTerrain(backend);
  else {
    const pending = Promise.withResolvers();
    backend._terrainPromise = pending.promise;
    backend.once('ready', loadReadyTerrain, { backend, ...pending });
  }
  map.eachLayer(setLayerTerrain, backend);
  map.fire('terrainchange');
}
