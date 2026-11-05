import { pluginState } from '../core/pluginState.js';
import { finishRasterTile } from './finishRasterTile.js';

export function loadRasterTile(backend, tile) {
  tile.started = true;
  const first = pluginState(backend)._loadingTiles === 0;
  pluginState(backend)._loadingTiles++;
  backend.fire('tileloadstart', /* allocation: required -- Listeners may retain this tileloadstart event’s payload after later layer operations. */ { tile, coords: tile.coords });
  if (first) backend.fire('loading');
  return finishRasterTile(backend, tile);
}
