import { compareVectorTileDistance } from './compareVectorTileDistance.js';

export function pumpVectorTiles() {
  if (!this.session) return;
  const center = this._map.getCenter(), pending = /* alloc */ [];
  let tile, point;
  for (tile of this.tiles.values()) {
    if (!tile.needed || tile.started) continue;
    point = this._map.project(center, tile.coords.z).divideBy(256);
    tile.distance = (tile.coords.x - point.x) ** 2 + (tile.coords.y - point.y) ** 2;
    pending.push(tile);
  }
  pending.sort(compareVectorTileDistance);
  for (tile of pending) {
    if (this.inflight >= 4) break;
    tile.started = true; this.inflight++; this.load(tile);
  }
}
