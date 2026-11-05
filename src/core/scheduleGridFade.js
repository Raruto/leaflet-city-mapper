import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

import { runGridFades } from './runGridFades.js';

export function scheduleGridFade(layer) {
  pluginState(layer)._fadeVersion = (pluginState(layer)._fadeVersion || 0) + 1;
  sharedState.pendingGridFades.set(layer, pluginState(layer)._fadeVersion);
  if (sharedState.gridFadeFrame === null) sharedState.gridFadeFrame = requestAnimationFrame(runGridFades);
  pluginState(layer)._fadeFrame = sharedState.gridFadeFrame;
}
