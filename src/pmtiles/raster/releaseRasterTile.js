import { destroyTexture } from '../../rendering/textures/destroyTexture.js';
import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../../scene/graph/setParent.js';
import { update } from '../../scene/lifecycle/update.js';

export function releaseRasterTile(backend, tile) {
  const key = `${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`;
  if (backend._rasterTiles.get(key) !== tile) return;
  backend._rasterTiles.delete(key);
  backend._rasterVersion = (backend._rasterVersion || 0) + 1;
  tile.request.abort();
  if(backend._terrain3D) removeRasterTile(backend._terrain3D, tile);
  if (tile.mesh) setParent(tile.mesh, null);
  if (tile.texture) destroyTexture(backend, tile.texture.texture);
  tile.image?.close();
  backend.fire('tileunload', { tile, coords: tile.coords });
  update(backend);
}
