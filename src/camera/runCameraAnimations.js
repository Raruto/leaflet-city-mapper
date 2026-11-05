import { state as sharedState } from '../state.js';
import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';
import { pluginState } from '../core/pluginState.js';

import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';

export function runCameraAnimations(now) {
  sharedState.cameraAnimationFrame = null;
  const pending = /* allocation: required -- Reentrant animation callbacks may queue replacements; this frame must process only its starting snapshot. */ [...sharedState.cameraAnimations];
  sharedState.cameraAnimations.clear();
  let failure;
  let map, animation, progress, eased;
  for ([map, animation] of pending) {
    pluginState(map)._cameraFrame = null;
    if (pluginState(map)._cameraAnimation !== animation) continue;
    progress = animation.duration
      ? Math.min(1, (now - animation.start) / (animation.duration * 1000)) : 1;
    eased = 1 - (1 - progress) ** 3;
    try {
      mapSetPitchAndBearing(map, animation.fromPitch + (Math.max(0, Math.min(85, animation.pitch)) - animation.fromPitch) * eased, animation.fromBearing + animation.delta * eased);
      if (progress < 1 && pluginState(map)._cameraAnimation === animation) scheduleCameraAnimation(map, animation);
      else if (pluginState(map)._cameraAnimation === animation) pluginState(map)._cameraAnimation = null;
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}
