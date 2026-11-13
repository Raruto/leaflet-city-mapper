import { cameraAnimationByMap } from '../weakmaps/cameraAnimationByMap.js';
import { cameraFrameByMap } from '../weakmaps/cameraFrameByMap.js';
import { cameraAnimations } from '../globals/cameraAnimations.js';
import { cameraAnimationFrame } from '../globals/cameraAnimationFrame.js';

/**
 * Remove a map's camera animation and cancel the shared frame if no animations remain.
 *
 * @param {L.Map} map Map whose animation should stop.
 */
export function cancelCameraAnimation(map) {
  cameraAnimations.delete(map);
  cameraAnimationByMap.set(map, null);
  cameraFrameByMap.set(map, null);
  if (!cameraAnimations.size && cameraAnimationFrame.value !== null) {
    cancelAnimationFrame(cameraAnimationFrame.value);
    cameraAnimationFrame.value = null;
  }
}
