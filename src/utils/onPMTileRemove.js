export function onPMTileRemove(backend, map) {
  backend._setTerrain3D(null);
  if (backend._container) L.TileLayer.prototype.onRemove.call(backend, map);
}
