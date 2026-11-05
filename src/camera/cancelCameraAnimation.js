import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

export function cancelCameraAnimation(map) {
  sharedState.cameraAnimations.delete(map);
  pluginState(map)._cameraAnimation = null;
  pluginState(map)._cameraFrame = null;
  if (!sharedState.cameraAnimations.size && sharedState.cameraAnimationFrame !== null) {
    cancelAnimationFrame(sharedState.cameraAnimationFrame);
    sharedState.cameraAnimationFrame = null;
  }
}
