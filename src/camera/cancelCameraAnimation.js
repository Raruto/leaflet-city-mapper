import { mapCameraState } from '../constants/mapCameraState.js';

export function cancelCameraAnimation(map) {
  mapCameraState.cameraAnimations.delete(map);
  map._cameraAnimation = null;
  map._cameraFrame = null;
  if (!mapCameraState.cameraAnimations.size && mapCameraState.cameraAnimationFrame !== null) {
    cancelAnimationFrame(mapCameraState.cameraAnimationFrame);
    mapCameraState.cameraAnimationFrame = null;
  }
}
