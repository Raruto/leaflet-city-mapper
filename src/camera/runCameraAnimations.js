import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';
import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraByMap } from '../globals/cameraByMap.js';

import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';


import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';

export function runCameraAnimations(now) {
  cameraAnimationFrame.value = null;
  const pending = /* alloc */ [...cameraAnimations];
  cameraAnimations.clear();
  let failure;
  let map, animation, progress, eased;
  for ([map, animation] of pending) {
    cameraByMap.get(map)._cameraFrame = null;
    if (cameraByMap.get(map)._cameraAnimation !== animation) continue;
    progress = animation.duration
      ? Math.min(1, (now - animation.start) / (animation.duration * 1000)) : 1;
    eased = 1 - (1 - progress) ** 3;
    try {
      mapSetPitchAndBearing(map, animation.fromPitch + (Math.max(0, Math.min(map.options.maxPitch, animation.pitch)) - animation.fromPitch) * eased, animation.fromBearing + animation.delta * eased);
      if (progress < 1 && cameraByMap.get(map)._cameraAnimation === animation) scheduleCameraAnimation(map, animation);
      else if (cameraByMap.get(map)._cameraAnimation === animation) cameraByMap.get(map)._cameraAnimation = null;
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}
