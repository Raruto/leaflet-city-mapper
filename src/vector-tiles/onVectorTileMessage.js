import { revokeVectorWorkerUrl } from './revokeVectorWorkerUrl.js';

/**
 * Resolve or reject the pending vector tile job for a worker response.
 *
 * @param {MessageEvent} event Worker message.
 */
export function onVectorTileMessage({ data }) {
  revokeVectorWorkerUrl(this);
  const pending = this.waiting.get(data.id);
  if (!pending) return;
  this.waiting.delete(data.id);
  if (data.error) pending.reject(/* alloc */ new Error(data.error));
  else pending.resolve(data);
}
