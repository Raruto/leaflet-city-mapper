import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';
import { cameraByMap } from '../globals/cameraByMap.js';



import { runCameraAnimations } from './runCameraAnimations.js';

export function scheduleCameraAnimation(map, animation) {
  cameraAnimations.set(map, animation);
  if (cameraAnimationFrame.value === null) cameraAnimationFrame.value = requestAnimationFrame(runCameraAnimations);
  cameraByMap.get(map)._cameraFrame = cameraAnimationFrame.value;
}
