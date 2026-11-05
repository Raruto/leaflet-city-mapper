import { mapCameraState } from './constants/mapCameraState.js';
import { runCameraAnimations } from './runCameraAnimations.js';

export function scheduleCameraAnimation(map, animation) {
  mapCameraState.cameraAnimations.set(map, animation);
  if (mapCameraState.cameraAnimationFrame === null) mapCameraState.cameraAnimationFrame = requestAnimationFrame(runCameraAnimations);
  map._cameraFrame = mapCameraState.cameraAnimationFrame;
}
