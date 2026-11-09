import { vectorWorkerByLayer } from '../weakmaps/vectorWorkerByLayer.js';

export function revokeVectorWorkerUrl(layer) {
  const entry = vectorWorkerByLayer.get(layer);
  if (entry?.blobUrl) {
    URL.revokeObjectURL(entry.blobUrl);
    entry.blobUrl = null;
  }
}
