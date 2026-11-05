import { sceneByLayer } from '../globals/sceneByLayer.js';


import { destroyTexture } from '../rendering/destroyTexture.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export function removeRasterTile(layer, tile) {
  sceneByLayer.get(layer)._terrainRequest?.abort();
  const mesh = sceneByLayer.get(layer)._rasterTiles.get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(layer);
  if (mesh.texture !== tile.texture) destroyTexture(layer, mesh.texture.texture);
  sceneByLayer.get(layer)._rasterTiles.delete(tile);
}
