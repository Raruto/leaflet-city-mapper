import { reportError } from '../scene/reportLayerError.js';
import { revokeVectorWorkerUrl } from './revokeVectorWorkerUrl.js';

/**
 * Reject pending vector jobs and report a worker error to the layer.
 *
 * @param {ErrorEvent} event Worker error event.
 */
export function onVectorTileWorkerError(event) {
  revokeVectorWorkerUrl(this);
  const error = /* alloc */ new Error(`Worker MVT: ${event.message}`);
  let pending;
  for (pending of this.waiting.values()) pending.reject(error);
  this.waiting.clear();
  reportError(this, error);
}
