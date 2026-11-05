import { TILE_SIZE } from "../constants/TILE_SIZE.js";
import { comparePendingTiles } from './comparePendingTiles.js';
import { loadRasterTile } from './loadRasterTile.js';

export function pumpRasterTiles(backend) {
  const map = backend._map;
  if (!map) return;
  const center = map.project(map.getCenter(), 0).divideBy(TILE_SIZE);
  const pending = [];
  for (const tile of backend._rasterTiles.values()) {
    if (tile.started || tile.request.signal.aborted) continue;
    const { coords } = tile;
    pending.push({ tile, distance: Math.hypot((coords.x + 0.5) / 2 ** coords.z - center.x,
      (coords.y + 0.5) / 2 ** coords.z - center.y) });
  }
  pending.sort(comparePendingTiles);
  for (const { tile } of pending) {
    if (backend._loadingTiles >= 4) break;
    loadRasterTile(backend, tile);
  }
}
