import { attachVectorTileBatch } from './attachVectorTileBatch.js';
import { vectorTilesIdle } from './vectorTilesIdle.js';
import { yieldTask } from '../utils/yieldTask.js';

export async function attachVectorTileBatches(owner, tile, group, batches, session) {
  let batch;
  for (batch of batches) {
    while (!vectorTilesIdle(owner, session) && owner.session === session &&
      !tile.controller.signal.aborted) await yieldTask(50);
    if (tile.controller.signal.aborted || owner.session !== session) return false;
    attachVectorTileBatch(owner, tile, group, batch);
    await yieldTask();
  }
  return true;
}
