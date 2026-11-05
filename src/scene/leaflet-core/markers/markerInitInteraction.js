import { mapCameraState } from '../../camera/constants/mapCameraState.js';
import { cameraMarkerDrag } from './cameraMarkerDrag.js';

export function markerInitInteraction() {
  const result = mapCameraState.markerMethods._initInteraction.call(this);
  cameraMarkerDrag.call(this);
  return result;
}
