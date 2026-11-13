import { paintVectorTileBatch } from './paintVectorTileBatch.js';
import { vectorStyleZoom } from './vectorStyleZoom.js';
import { vectorTilesIdle } from './vectorTilesIdle.js';
import { yieldTask } from '../utils/yieldTask.js';

/**
 * Update rendered tile paint incrementally while the zoom and session remain current.
 *
 * @returns {Promise<void>} Completion of the current paint revision.
 */
export async function updateVectorTilePaint() {
  const zoom = vectorStyleZoom(this), session = this.session;
  if (this.paintZoom === zoom) return;
  const revision = this.paintRevision = (this.paintRevision || 0) + 1;
  let updated = 0, tile, batch;
  for (tile of this.tiles.values()) {
    if (!tile.rendered) continue;
    for (batch of tile.rendered) {
      if (!vectorTilesIdle(this, session) || this.paintRevision !== revision || vectorStyleZoom(this) !== zoom) return;
      paintVectorTileBatch(batch, zoom);
      if (++updated % 32 === 0) await yieldTask();
    }
  }
  this.paintZoom = zoom;
}
