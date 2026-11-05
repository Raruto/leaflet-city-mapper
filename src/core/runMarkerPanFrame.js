import { mapCameraState } from '../constants/mapCameraState.js';

export function runMarkerPanFrame() {
  mapCameraState.markerPanFrame = null;
  const pending = [...mapCameraState.pendingMarkerPan];
  mapCameraState.pendingMarkerPan.clear();
  for (const [drag, event] of pending) {
    drag._panRequest = null;
    drag._adjustPan(event);
  }
}
