export function _abortLoading(backed) {
  // Requests can still be pending while an image with no src reports complete.
  for (const { coords, el } of Object.values(backed._tiles)) {
    if (coords.z !== backed._tileZoom) backed._releaseTile({ tile: el });
  }
  L.TileLayer.prototype._abortLoading.call(backed);
}
