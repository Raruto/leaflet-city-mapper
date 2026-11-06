import { sceneByLayer } from '../globals/sceneByLayer.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function retainRasterTiles(backend, required) {
  const tiles = sceneByLayer.get(backend)._rasterTiles;
  let key, tile, coords;
  for ([key, tile] of tiles) {
    if (!required.has(key) && !tile.done) releaseRasterTile(backend, tile);
  }
  for ([key, coords] of required) {
    if (tiles.has(key)) continue;
    tile = /* alloc */ { coords, request: /* alloc */ new AbortController(), done: false };
    tiles.set(key, tile);
  }
}
