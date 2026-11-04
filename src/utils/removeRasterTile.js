import { destroyTexture } from './destroyTexture.js';
import { setParent } from './setParent.js';
import { update } from './update.js';

export function removeRasterTile(layer, tile) {
  layer._terrainRequest?.abort();
  const mesh = layer._rasterTiles.get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(layer);
  destroyTexture(layer, mesh.texture.texture);
  layer._rasterTiles.delete(tile);
}
