import { finishRasterTile } from './finishRasterTile.js';

export function loadRasterTile(backend, tile) {
  tile.started = true;
  const first = backend._loadingTiles === 0;
  backend._loadingTiles++;
  backend.fire('tileloadstart', { tile, coords: tile.coords });
  if (first) backend.fire('loading');
  return finishRasterTile(backend, tile);
}
