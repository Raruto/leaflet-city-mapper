import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { update } from './update.js';
import { render } from "../rendering/render.js";

import { renderPendingMapChange } from './renderPendingMapChange.js';

/** Map movement: render within the frame of Leaflet's CSS transforms, coalescing same-tick events. */

export function onMapChange() {
  const layer = this;
  if (pluginState(layer)._queued) return;
  pluginState(layer)._queued = true;
  sharedState.pendingMapChanges.push(layer);
  queueMicrotask(renderPendingMapChange);
}
