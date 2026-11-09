import { vectorTileOverlaps } from './vectorTileOverlaps.js';

export function vectorTileAwaited(layer, stale) {
  let tile;
  for (tile of layer.tiles.values()) {
    if (tile.needed && !tile.group && vectorTileOverlaps(tile.coords, stale.coords)) return true;
  }
  return false;
}
