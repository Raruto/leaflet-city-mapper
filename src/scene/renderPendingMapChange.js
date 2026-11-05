import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { update } from './update.js';
import { render } from '../rendering/render.js';

export function renderPendingMapChange() {
  const layer = sharedState.pendingMapChanges.shift();
  pluginState(layer)._queued = false;
  if (pluginState(layer)._shared !== layer || !pluginState(layer).renderer) return;
  if (layer._map._animatingZoom) update(layer);
  else render(layer);
}
