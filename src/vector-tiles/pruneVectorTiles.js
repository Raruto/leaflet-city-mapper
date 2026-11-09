import { reportError } from '../scene/reportLayerError.js';

export function pruneVectorTiles() {
  let tile, key, complete = true;
  for (tile of this.tiles.values()) {
    if (tile.needed && !tile.group) { complete = false; break; }
  }
  for ([key, tile] of this.tiles) {
    if (tile.needed || tile.group && !complete) continue;
    tile.controller.abort(); this.tiles.delete(key);
    if (tile.group) this.retire(tile.group).catch(reportError.bind(null, this));
  }
}
