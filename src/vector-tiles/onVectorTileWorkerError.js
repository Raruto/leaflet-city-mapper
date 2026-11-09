import { reportError } from '../scene/reportLayerError.js';

export function onVectorTileWorkerError(event) {
  const error = /* alloc */ new Error(`Worker MVT: ${event.message}`);
  let pending;
  for (pending of this.waiting.values()) pending.reject(error);
  this.waiting.clear();
  reportError(this, error);
}
