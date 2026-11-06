import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { rasterVersionByLayer } from '../weakmaps/rasterVersionByLayer.js';
import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';



import { destroyTexture } from '../textures/destroyTexture.js';
import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/scheduleSceneUpdate.js';

export function releaseRasterTile(layer, tile) {
  const key = `${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`;
  if (rasterTilesByLayer.get(layer).get(key) !== tile) return;
  rasterTilesByLayer.get(layer).delete(key);
  rasterVersionByLayer.set(layer, (rasterVersionByLayer.get(layer) || 0) + 1);
  tile.request.abort();
  if(terrain3DByLayer.get(layer)) removeRasterTile(terrain3DByLayer.get(layer), tile);
  if (tile.mesh) setParent(tile.mesh, null);
  if (tile.texture) destroyTexture(layer, tile.texture.texture);
  tile.image?.close();
  layer.fire('tileunload', /* alloc */ { tile, coords: tile.coords });
  update(layer);
}
