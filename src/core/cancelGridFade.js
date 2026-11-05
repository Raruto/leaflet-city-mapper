import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

export function cancelGridFade(layer) {
  sharedState.pendingGridFades.delete(layer);
  pluginState(layer)._fadeFrame = null;
  if (!sharedState.pendingGridFades.size && sharedState.gridFadeFrame !== null) {
    cancelAnimationFrame(sharedState.gridFadeFrame);
    sharedState.gridFadeFrame = null;
  }
}
