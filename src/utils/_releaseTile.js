export function _releaseTile(backend, { tile }) {
  backend._terrain3D?.removeRasterTile(tile);
  tile.request.abort();
  backend._releaseURL(tile);
}
