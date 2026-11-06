import { cameraAnimationByMap } from '../weakmaps/cameraAnimationByMap.js';
import { cameraFrameByMap } from '../weakmaps/cameraFrameByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';



export function cancelCameraAnimation(map) {
  cameraAnimations.delete(map);
  mutateWeakMap(cameraAnimationByMap, map, "=", null);
  mutateWeakMap(cameraFrameByMap, map, "=", null);
  if (!cameraAnimations.size && cameraAnimationFrame.value !== null) {
    cancelAnimationFrame(cameraAnimationFrame.value);
    cameraAnimationFrame.value = null;
  }
}
