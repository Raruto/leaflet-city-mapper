import { mapCameraState } from '../../camera/constants/mapCameraState.js';
import { runMarkerPanFrame } from './runMarkerPanFrame.js';

export function scheduleMarkerPan(drag, event) {
  mapCameraState.pendingMarkerPan.set(drag, event);
  if (mapCameraState.markerPanFrame === null) mapCameraState.markerPanFrame = requestAnimationFrame(runMarkerPanFrame);
  drag._panRequest = mapCameraState.markerPanFrame;
}
