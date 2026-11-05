import { sceneByLayer } from '../globals/sceneByLayer.js';


import { destroyTexture } from '../rendering/destroyTexture.js';
import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export function releaseRasterTile(backend, tile) {
  const key = `${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`;
  if (sceneByLayer.get(backend)._rasterTiles.get(key) !== tile) return;
  sceneByLayer.get(backend)._rasterTiles.delete(key);
  sceneByLayer.get(backend)._rasterVersion = (sceneByLayer.get(backend)._rasterVersion || 0) + 1;
  tile.request.abort();
  if(sceneByLayer.get(backend)._terrain3D) removeRasterTile(sceneByLayer.get(backend)._terrain3D, tile);
  if (tile.mesh) setParent(tile.mesh, null);
  if (tile.texture) destroyTexture(backend, tile.texture.texture);
  tile.image?.close();
  backend.fire('tileunload', /* allocation: required -- Listeners may retain this tileunload event’s payload after later layer operations. */ { tile, coords: tile.coords });
  update(backend);
}
