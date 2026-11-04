import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from "../pmtiles/rasterTiles.js";
import { onAdd3DLayer } from '../scene/onAdd3DLayer.js';

export function onTerrainAdd(backend, map) {
  if (map._terrain3D && map._terrain3D !== backend) {
    throw new Error('Only one terrain layer can be active per map');
  }
  map._terrain3D = backend;
  onAdd3DLayer(backend, map);
  backend._terrainPromise = backend.root
    ? loadTerrain(backend)
    : new Promise(resolve => backend.once('ready', () => loadTerrain(backend).then(resolve), backend));
  map.eachLayer(layer => {
    if (layer._type === 'pmtiles') setRasterTerrain(layer, backend);
  });
  map.fire('terrainchange');
}
