import { reportError } from '../scene/reportLayerError.js';
import { revokeVectorWorkerUrl } from './revokeVectorWorkerUrl.js';

export function onVectorTileWorkerError(event) {
  revokeVectorWorkerUrl(this);
  const error = /* alloc */ new Error(`Worker MVT: ${event.message}`);
  let pending;
  for (pending of this.waiting.values()) pending.reject(error);
  this.waiting.clear();
  reportError(this, error);
}
