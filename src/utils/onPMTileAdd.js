import { attach } from './attach.js';
import { updateRasterTiles } from './rasterTiles.js';

export function onPMTileAdd(backend, map) {
  if (!backend.location) backend.location = map.getCenter();
  const attached = attach(backend, map);
  attached.then(() => {
    backend._added.resolve();
    backend._setTerrain3D(map._terrain3D);
  })
    .catch(error => backend.fire('error', { error }));
  Promise.all([attached, backend.ready]).then(() => {
    if (backend._map === map && map.hasLayer(backend)) updateRasterTiles(backend);
  }).catch(error => backend.fire('error', { error }));
}
