export function _abortLoading(layer) {
  // Requests can still be pending while an image with no src reports complete.
  for (const { coords, el } of Object.values(layer._tiles)) {
    if (coords.z !== layer._tileZoom) layer._releaseTile({ tile: el });
  }
  L.TileLayer.prototype._abortLoading.call(layer);
}
