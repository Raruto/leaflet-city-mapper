import { update } from './update.js';
import { render } from "../../rendering/render.js";
import { onMapChangeState } from './constants/onMapChangeState.js';
import { renderPendingMapChange } from './renderPendingMapChange.js';

/** Map movement: render within the frame of Leaflet's CSS transforms, coalescing same-tick events. */

onMapChangeState.pendingMapChanges = [];

export function onMapChange() {
  const layer = this;
  if (layer._queued) return;
  layer._queued = true;
  onMapChangeState.pendingMapChanges.push(layer);
  queueMicrotask(renderPendingMapChange);
}
