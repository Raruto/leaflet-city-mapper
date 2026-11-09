import { paintVectorTileBatch } from './paintVectorTileBatch.js';
import { vectorTilesIdle } from './vectorTilesIdle.js';
import { yieldTask } from '../utils/yieldTask.js';

export async function updateVectorTilePaint() {
  const zoom = this._map.getZoom(), session = this.session;
  if (this.paintZoom === zoom) return;
  const revision = this.paintRevision = (this.paintRevision || 0) + 1;
  let updated = 0, tile, batch;
  for (tile of this.tiles.values()) {
    if (!tile.rendered) continue;
    for (batch of tile.rendered) {
      if (!vectorTilesIdle(this, session) || this.paintRevision !== revision || this._map.getZoom() !== zoom) return;
      paintVectorTileBatch(batch, zoom);
      if (++updated % 32 === 0) await yieldTask();
    }
  }
  this.paintZoom = zoom;
}
