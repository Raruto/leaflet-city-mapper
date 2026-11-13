import { cameraFrameByMap } from '../weakmaps/cameraFrameByMap.js';
import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';
import { runCameraAnimations } from './runCameraAnimations.js';

/**
 * Queue a map's camera animation on the shared animation frame.
 *
 * @param {L.Map} map Map whose camera should animate.
 * @param {Object} animation Camera animation state.
 */
export function scheduleCameraAnimation(map, animation) {
  cameraAnimations.set(map, animation);
  if (cameraAnimationFrame.value === null) cameraAnimationFrame.value = requestAnimationFrame(runCameraAnimations);
  cameraFrameByMap.set(map, cameraAnimationFrame.value);
}
