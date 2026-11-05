import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { render } from '../rendering/render.js';

export function renderPendingUpdates() {
  const updates = /* allocation: required -- Snapshot updates before reentrant rendering mutates the queue. */ [...sharedState.pendingUpdates];
  sharedState.pendingUpdates.clear();
  let failure;
  let backend;
  for (backend of updates) {
    pluginState(backend)._frame = null;
    if (pluginState(backend)._shared !== backend || !pluginState(backend).renderer) continue;
    try {
      render(backend);
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}
