import { loadTerrain } from "./loadTerrain.js";
import { setRasterTerrain } from "./rasterTiles.js";

export function onTerrainAdd(backend, map) {
  if (map._terrain3D && map._terrain3D !== backend) {
    throw new Error('Only one terrain layer can be active per map');
  }
  map._terrain3D = backend;
  L.Layer.types['3d'].prototype.onAdd.call(backend, map);
  backend._terrainPromise = backend.root
    ? loadTerrain(backend)
    : new Promise(resolve => backend.once('ready', () => loadTerrain(backend).then(resolve), backend));
  map.eachLayer(layer => {
    if (layer instanceof L.Layer.types.pmtiles) setRasterTerrain(layer, backend);
  });
  map.fire('terrainchange');
}
