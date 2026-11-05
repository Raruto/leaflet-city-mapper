import { pluginState } from '../core/pluginState.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function pruneRasterTiles(backend) {
  const wanted = pluginState(backend)._wantedRasterTiles;
  const now = performance.now();
  if (pluginState(backend)._pruneVersion === pluginState(backend)._rasterVersion && pluginState(backend)._pruneWanted === wanted &&
    now < pluginState(backend)._pruneAfter) return Number.isFinite(pluginState(backend)._pruneAfter);
  pluginState(backend)._pruneVersion = pluginState(backend)._rasterVersion;
  pluginState(backend)._pruneWanted = wanted;
  pluginState(backend)._pruneAfter = Infinity;
  const pending = /* allocation: required -- Tile-unload listeners can reenter pruning, so the active coverage snapshot must remain independent. */ [];
  let key, tile, parts, overlaps, coords, zoom;
  for (key of wanted) {
    tile = pluginState(backend)._rasterTiles.get(key);
    if (tile?.done && now - tile.loadedAt < 250) {
      pluginState(backend)._pruneAfter = Math.min(pluginState(backend)._pruneAfter, tile.loadedAt + 250);
    }
    if (!tile?.done || now - tile.loadedAt < 250) {
      parts = key.split('/');
      pending.push(/* allocation: required -- Reentrant unload callbacks must not overwrite coordinates in the active pending-coverage snapshot. */ { z: Number(parts[0]), x: Number(parts[1]), y: Number(parts[2]) });
    }
  }
  for ([key, tile] of pluginState(backend)._rasterTiles) {
    if (wanted.has(key)) continue;
    overlaps = false;
    for (coords of pending) {
      zoom = Math.min(coords.z, tile.coords.z);
      if (Math.floor(coords.x / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.x / 2 ** (tile.coords.z - zoom)) &&
        Math.floor(coords.y / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.y / 2 ** (tile.coords.z - zoom))) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) releaseRasterTile(backend, tile);
  }
  return Number.isFinite(pluginState(backend)._pruneAfter);
}
