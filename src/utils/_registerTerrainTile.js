export function _registerTerrainTile(backend, coords, tile) {
  if (!backend._terrain3D) return;
  const terrain = backend._terrain3D;
  terrain.addRasterTile(backend, coords, tile).catch(error => {
    if (backend._terrain3D === terrain && tile.isConnected) backend.fire('tileerror', { tile, coords, error });
  });
}
