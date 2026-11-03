import { destroyTexture } from './destroyTexture.js';
import { setParent } from './setParent.js';
import { update } from './update.js';

export function removeRasterTile(backend, tile) {
  backend._terrainRequest?.abort();
  const mesh = backend._rasterTiles.get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(backend);
  destroyTexture(backend, mesh.texture.texture);
  backend._rasterTiles.delete(tile);
  tile.style.visibility = tile._terrainVisibility;
  delete tile._terrainVisibility;
}
