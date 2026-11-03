export function _setTerrain3D(backend, terrain) {
  if (backend._terrain3D === terrain) return;
  for (const { el } of Object.values(backend._tiles || {})) backend._terrain3D?.removeRasterTile(el);
  backend._terrain3D = terrain || null;
  if (backend._terrain3D) {
    for (const { coords, el } of Object.values(backend._tiles || {})) {
      if (el.done) backend._registerTerrainTile(coords, el);
    }
  }
}
