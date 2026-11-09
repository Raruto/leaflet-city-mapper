import { reportError } from '../scene/reportLayerError.js';
import { vectorTileAwaited } from './vectorTileAwaited.js';

export function pruneVectorTiles() {
  let tile, key;
  for ([key, tile] of this.tiles) {
    if (tile.needed || tile.group && vectorTileAwaited(this, tile)) continue;
    tile.controller.abort(); this.tiles.delete(key);
    if (tile.group) this.retire(tile.group).catch(reportError.bind(null, this));
  }
}
