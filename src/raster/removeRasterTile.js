import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { terrainRequestByLayer } from '../weakmaps/terrainRequestByLayer.js';



import { destroyTexture } from '../textures/destroyTexture.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/scheduleSceneUpdate.js';

export function removeRasterTile(layer, tile) {
  terrainRequestByLayer.get(layer)?.abort();
  const mesh = rasterTilesByLayer.get(layer).get(tile);
  if (!mesh) return;
  setParent(mesh, null);
  update(layer);
  if (mesh.texture !== tile.texture) destroyTexture(layer, mesh.texture.texture);
  rasterTilesByLayer.get(layer).delete(tile);
}
