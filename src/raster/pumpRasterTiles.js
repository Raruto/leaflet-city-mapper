import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { comparePendingTiles } from './comparePendingTiles.js';
import { loadRasterTile } from './loadRasterTile.js';

export function pumpRasterTiles(backend) {
  const map = backend._map;
  if (!map) return;
  const center = map.project(map.getCenter(), 0).divideBy(sharedState.TILE_SIZE);
  const pending = /* allocation: required -- Tile-load-start listeners can reenter scheduling, so each active queue needs its own ordering snapshot. */ [];
  let tile, coords;
  for (tile of pluginState(backend)._rasterTiles.values()) {
    if (tile.started || tile.request.signal.aborted) continue;
    ({ coords } = tile);
    pending.push(/* allocation: required -- Reentrant load-start callbacks must not overwrite this queue entry’s tile and ordering distance. */ { tile, distance: Math.hypot((coords.x + 0.5) / 2 ** coords.z - center.x,
      (coords.y + 0.5) / 2 ** coords.z - center.y) });
  }
  pending.sort(comparePendingTiles);
  for ({ tile } of pending) {
    if (pluginState(backend)._loadingTiles >= 4) break;
    loadRasterTile(backend, tile);
  }
}
