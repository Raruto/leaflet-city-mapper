import { pluginState } from '../core/pluginState.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export function releaseRasterTile(backend, tile) {
  const key = `${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`;
  if (pluginState(backend)._rasterTiles.get(key) !== tile) return;
  pluginState(backend)._rasterTiles.delete(key);
  pluginState(backend)._rasterVersion = (pluginState(backend)._rasterVersion || 0) + 1;
  tile.request.abort();
  if(pluginState(backend)._terrain3D) removeRasterTile(pluginState(backend)._terrain3D, tile);
  if (tile.mesh) setParent(tile.mesh, null);
  if (tile.texture) destroyTexture(backend, tile.texture.texture);
  tile.image?.close();
  backend.fire('tileunload', /* allocation: required -- Listeners may retain this tileunload event’s payload after later layer operations. */ { tile, coords: tile.coords });
  update(backend);
}
