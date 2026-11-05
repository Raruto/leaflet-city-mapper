import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { render } from "../rendering/render.js";

import { renderPendingUpdates } from './renderPendingUpdates.js';

/** Scene graph, shared camera and frame rendering. */
/** Content changes: render once on the next animation frame. */
export function update(backend) {
  const shared = pluginState(backend)._shared;
  if (!shared) return backend;
  if (shared !== backend) {
    update(shared);
    return backend;
  }
  if (pluginState(backend)._frame != null) return backend;
  const first = sharedState.pendingUpdates.values().next().value;
  sharedState.pendingUpdates.add(backend);
  pluginState(backend)._frame = first ? pluginState(first)._frame : requestAnimationFrame(renderPendingUpdates);
  return backend;
}
