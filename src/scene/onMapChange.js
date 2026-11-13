import { queuedByLayer } from '../weakmaps/queuedByLayer.js';
import { pendingMapChanges } from '../globals/pendingMapChanges.js';
import { update } from './scheduleSceneUpdate.js';
import { render } from "../rendering/render.js";
import { renderPendingMapChange } from './renderPendingMapChange.js';

/** Map movement: render within the frame of Leaflet's CSS transforms, coalescing same-tick events. */
export function onMapChange() {
  const layer = this;
  if (queuedByLayer.get(layer)) return;
  queuedByLayer.set(layer, true);
  pendingMapChanges.push(layer);
  queueMicrotask(renderPendingMapChange);
}
