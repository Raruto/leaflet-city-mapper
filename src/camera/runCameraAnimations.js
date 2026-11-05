import { mapCameraState } from '../constants/mapCameraState.js';
import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';

export function runCameraAnimations(now) {
  mapCameraState.cameraAnimationFrame = null;
  const pending = [...mapCameraState.cameraAnimations];
  mapCameraState.cameraAnimations.clear();
  let failure;
  let map, animation, progress, eased;
  for ([map, animation] of pending) {
    map._cameraFrame = null;
    if (map._cameraAnimation !== animation) continue;
    progress = animation.duration
      ? Math.min(1, (now - animation.start) / (animation.duration * 1000)) : 1;
    eased = 1 - (1 - progress) ** 3;
    try {
      map._setPitchAndBearing(
        animation.fromPitch + (Math.max(0, Math.min(85, animation.pitch)) - animation.fromPitch) * eased,
        animation.fromBearing + animation.delta * eased,
      );
      if (progress < 1 && map._cameraAnimation === animation) scheduleCameraAnimation(map, animation);
      else if (map._cameraAnimation === animation) map._cameraAnimation = null;
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}
