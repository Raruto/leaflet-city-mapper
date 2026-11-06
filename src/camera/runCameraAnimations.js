import { cameraAnimationByMap } from '../weakmaps/cameraAnimationByMap.js';
import { cameraFrameByMap } from '../weakmaps/cameraFrameByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';
import { cameraAnimations } from '../globals/cameraAnimations.js';

import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';


import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';

export function runCameraAnimations(now) {
  cameraAnimationFrame.value = null;
  const pending = /* alloc */ [...cameraAnimations];
  cameraAnimations.clear();
  let failure;
  let map, animation, progress, eased;
  for ([map, animation] of pending) {
    mutateWeakMap(cameraFrameByMap, map, "=", null);
    if (cameraAnimationByMap.get(map) !== animation) continue;
    progress = animation.duration
      ? Math.min(1, (now - animation.start) / (animation.duration * 1000)) : 1;
    eased = 1 - (1 - progress) ** 3;
    try {
      mapSetPitchAndBearing(map, animation.fromPitch + (Math.max(0, Math.min(map.options.maxPitch, animation.pitch)) - animation.fromPitch) * eased, animation.fromBearing + animation.delta * eased);
      if (progress < 1 && cameraAnimationByMap.get(map) === animation) scheduleCameraAnimation(map, animation);
      else if (cameraAnimationByMap.get(map) === animation) mutateWeakMap(cameraAnimationByMap, map, "=", null);
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}
