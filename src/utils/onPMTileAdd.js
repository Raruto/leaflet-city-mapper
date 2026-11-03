export function onPMTileAdd(backend, map) {
  if (backend.header) {
    L.TileLayer.prototype.onAdd.call(backend, map);
    backend._setTerrain3D(map._terrain3D);
  } else {
    backend.ready = backend.ready.then(layer => {
      if (backend._map === map && map.hasLayer(backend) && !backend._container) {
        L.TileLayer.prototype.onAdd.call(backend, map);
        backend._setTerrain3D(map._terrain3D);
      }
      return layer;
    });
  }
}
