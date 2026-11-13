import { vectorWorkerByLayer } from '../weakmaps/vectorWorkerByLayer.js';

/**
 * Revoke a vector worker's temporary blob URL once it is no longer needed.
 *
 * @param {Object} layer Owning vector tile layer.
 */
export function revokeVectorWorkerUrl(layer) {
  const entry = vectorWorkerByLayer.get(layer);
  if (entry?.blobUrl) {
    URL.revokeObjectURL(entry.blobUrl);
    entry.blobUrl = null;
  }
}
