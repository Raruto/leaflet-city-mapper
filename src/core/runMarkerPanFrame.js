import { state as sharedState } from '../state.js';

export function runMarkerPanFrame() {
  sharedState.markerPanFrame = null;
  const pending = /* allocation: required -- Drag callbacks may queue new pans that belong to a subsequent frame. */ [...sharedState.pendingMarkerPan];
  sharedState.pendingMarkerPan.clear();
  let drag, event;
  for ([drag, event] of pending) {
    drag._panRequest = null;
    drag._adjustPan(event);
  }
}
