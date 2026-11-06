import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';

import { TILE_SIZE } from '../globals/TILE_SIZE.js';



import { comparePendingTiles } from './comparePendingTiles.js';
import { loadRasterTile } from './loadRasterTile.js';

export function pumpRasterTiles(layer) {
  const map = layer._map;
  if (!map) return;
  const center = map.project(map.getCenter(), 0).divideBy(TILE_SIZE);
  const pending = /* alloc */ [];
  let tile, coords;
  for (tile of rasterTilesByLayer.get(layer).values()) {
    if (tile.started || tile.request.signal.aborted) continue;
    ({ coords } = tile);
    pending.push(/* alloc */ { tile, distance: Math.hypot((coords.x + 0.5) / 2 ** coords.z - center.x,
      (coords.y + 0.5) / 2 ** coords.z - center.y) });
  }
  pending.sort(comparePendingTiles);
  for ({ tile } of pending) {
    if (loadingTilesByLayer.get(layer) >= 4) break;
    loadRasterTile(layer, tile);
  }
}
