import { vectorTileEvents } from '../globals/vectorTileEvents.js';
import { vectorWorkerByLayer } from '../weakmaps/vectorWorkerByLayer.js';
import { revokeVectorWorkerUrl } from './revokeVectorWorkerUrl.js';

export function onVectorTileRemove(map) {
  map.off(vectorTileEvents, this.refresh);
  clearTimeout(this.timer);
  this.session = null;
  this.worker.terminate();
  revokeVectorWorkerUrl(this);
  vectorWorkerByLayer.delete(this);
  let pending, tile, group, marker;
  for (pending of this.waiting.values()) pending.reject(/* alloc */ new DOMException('Layer removed', 'AbortError'));
  this.waiting.clear();
  for (tile of this.tiles.values()) { tile.controller.abort(); tile.group?.remove(); }
  for (group of this.retiring) group.remove();
  for (marker of this.labels.values()) marker.remove();
  this.tiles.clear(); this.labels.clear(); this.retiring.clear();
}
