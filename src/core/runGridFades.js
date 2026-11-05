import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

import { updateGridOpacity } from './updateGridOpacity.js';

export function runGridFades() {
  sharedState.gridFadeFrame = null;
  const layers = /* allocation: required -- Reentrant fade callbacks may reschedule layers; process only the starting frame snapshot. */ [...sharedState.pendingGridFades];
  let layer, version;
  for ([layer, version] of layers) {
    if (sharedState.pendingGridFades.get(layer) !== version) continue;
    sharedState.pendingGridFades.delete(layer);
    pluginState(layer)._fadeFrame = null;
    updateGridOpacity.call(layer);
  }
}
