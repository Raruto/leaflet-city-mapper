import { attach } from './attach.js';
import { setRasterTerrain, updateRasterTiles } from './rasterTiles.js';

export function onPMTileAdd(backend, map) {
  if (!backend.location) backend.location = map.getCenter();
  const attached = attach(backend, map);
  attached.then(() => {
    backend._added.resolve();
    setRasterTerrain(backend, map._terrain3D);
  })
    .catch(error => backend.fire('error', { error }));
  Promise.all([attached, backend.ready]).then(() => {
    if (backend._map === map && map.hasLayer(backend)) updateRasterTiles(backend);
  }).catch(error => backend.fire('error', { error }));
}
