import { sceneByLayer } from '../globals/sceneByLayer.js';
import { pendingMapChanges } from '../globals/pendingMapChanges.js';


import { update } from './update.js';
import { render } from "../rendering/render.js";

import { renderPendingMapChange } from './renderPendingMapChange.js';

/** Map movement: render within the frame of Leaflet's CSS transforms, coalescing same-tick events. */

export function onMapChange() {
  const layer = this;
  if (sceneByLayer.get(layer)._queued) return;
  sceneByLayer.get(layer)._queued = true;
  pendingMapChanges.push(layer);
  queueMicrotask(renderPendingMapChange);
}
