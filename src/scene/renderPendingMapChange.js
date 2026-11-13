import { queuedByLayer } from '../weakmaps/queuedByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { pendingMapChanges } from '../globals/pendingMapChanges.js';
import { update } from './scheduleSceneUpdate.js';
import { render } from '../rendering/render.js';

/** Render the next queued map change, or schedule a frame during animated zoom. */
export function renderPendingMapChange() {
  const layer = pendingMapChanges.shift();
  queuedByLayer.set(layer, false);
  if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) return;
  if (layer._map._animatingZoom) update(layer);
  else render(layer);
}
