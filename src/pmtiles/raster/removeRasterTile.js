import { destroyTexture } from '../../rendering/textures/destroyTexture.js';
import { setParent } from '../../scene/graph/setParent.js';
import { update } from '../../scene/lifecycle/update.js';

export function removeRasterTile(layer, tile) {
  layer._terrainRequest?.abort();
  const mesh = layer._rasterTiles.get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(layer);
  if (mesh.texture !== tile.texture) destroyTexture(layer, mesh.texture.texture);
  layer._rasterTiles.delete(tile);
}
