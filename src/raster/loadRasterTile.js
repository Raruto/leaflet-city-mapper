import { sceneByLayer } from '../globals/sceneByLayer.js';


import { finishRasterTile } from './finishRasterTile.js';

export function loadRasterTile(backend, tile) {
  tile.started = true;
  const first = sceneByLayer.get(backend)._loadingTiles === 0;
  sceneByLayer.get(backend)._loadingTiles++;
  backend.fire('tileloadstart', /* alloc */ { tile, coords: tile.coords });
  if (first) backend.fire('loading');
  return finishRasterTile(backend, tile);
}
