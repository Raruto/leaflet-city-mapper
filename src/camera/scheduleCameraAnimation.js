import { cameraFrameByMap } from '../weakmaps/cameraFrameByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';



import { runCameraAnimations } from './runCameraAnimations.js';

export function scheduleCameraAnimation(map, animation) {
  cameraAnimations.set(map, animation);
  if (cameraAnimationFrame.value === null) cameraAnimationFrame.value = requestAnimationFrame(runCameraAnimations);
  mutateWeakMap(cameraFrameByMap, map, "=", cameraAnimationFrame.value);
}
