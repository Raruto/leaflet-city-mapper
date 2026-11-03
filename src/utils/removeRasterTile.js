import { destroyTexture } from './destroyTexture';

export function removeRasterTile(backend, tile) {
  backend._terrainRequest?.abort();
  const mesh = backend._rasterTiles.get(tile);
  if (!mesh) return;
  backend.remove(mesh);
  destroyTexture(backend, mesh.texture.texture);
  backend._rasterTiles.delete(tile);
  tile.style.visibility = tile._terrainVisibility;
  delete tile._terrainVisibility;
}
