import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { runCameraAnimations } from './runCameraAnimations.js';

export function scheduleCameraAnimation(map, animation) {
  sharedState.cameraAnimations.set(map, animation);
  if (sharedState.cameraAnimationFrame === null) sharedState.cameraAnimationFrame = requestAnimationFrame(runCameraAnimations);
  pluginState(map)._cameraFrame = sharedState.cameraAnimationFrame;
}
