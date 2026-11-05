import { pluginState } from '../core/pluginState.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export function removeRasterTile(layer, tile) {
  pluginState(layer)._terrainRequest?.abort();
  const mesh = pluginState(layer)._rasterTiles.get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(layer);
  if (mesh.texture !== tile.texture) destroyTexture(layer, mesh.texture.texture);
  pluginState(layer)._rasterTiles.delete(tile);
}
