import { attachVectorTileBatch } from './attachVectorTileBatch.js';
import { vectorTilesIdle } from './vectorTilesIdle.js';
import { yieldTask } from '../utils/yieldTask.js';

/**
 * Attach vector batches incrementally while the tile session remains current.
 *
 * @param {Object} owner Vector tile layer.
 * @param {Object} tile Tile receiving the batches.
 * @param {Object} group Leaflet group receiving the layers.
 * @param {Array} batches Prepared vector batches.
 * @param {Object} session Session identity.
 *
 * @returns {Promise<boolean>} Whether every batch was attached.
 */
export async function attachVectorTileBatches(owner, tile, group, batches, session) {
  let batch, start = performance.now();
  for (batch of batches) {
    while (!vectorTilesIdle(owner, session) && owner.session === session &&
      !tile.controller.signal.aborted) await yieldTask(50);
    if (tile.controller.signal.aborted || owner.session !== session) return false;
    attachVectorTileBatch(owner, tile, group, batch);
    if (performance.now() - start > 8) { await yieldTask(); start = performance.now(); }
  }
  return true;
}
