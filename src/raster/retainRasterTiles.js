import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';

import { releaseRasterTile } from './releaseRasterTile.js';

export function retainRasterTiles(layer, required) {
  const tiles = rasterTilesByLayer.get(layer);
  let key, tile, coords;
  for ([key, tile] of tiles) {
    if (!required.has(key) && !tile.done) releaseRasterTile(layer, tile);
  }
  for ([key, coords] of required) {
    if (tiles.has(key)) continue;
    tile = /* alloc */ { coords, request: /* alloc */ new AbortController(), done: false };
    tiles.set(key, tile);
  }
}
