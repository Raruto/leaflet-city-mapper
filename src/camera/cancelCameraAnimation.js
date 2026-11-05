import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';



export function cancelCameraAnimation(map) {
  cameraAnimations.delete(map);
  cameraByMap.get(map)._cameraAnimation = null;
  cameraByMap.get(map)._cameraFrame = null;
  if (!cameraAnimations.size && cameraAnimationFrame.value !== null) {
    cancelAnimationFrame(cameraAnimationFrame.value);
    cameraAnimationFrame.value = null;
  }
}
