import { markerPanFrame } from '../globals/markerPanFrame.js';
import { pendingMarkerPan } from '../globals/pendingMarkerPan.js';


export function runMarkerPanFrame() {
  markerPanFrame.value = null;
  const pending = /* allocation: required -- Drag callbacks may queue new pans that belong to a subsequent frame. */ [...pendingMarkerPan];
  pendingMarkerPan.clear();
  let drag, event;
  for ([drag, event] of pending) {
    drag._panRequest = null;
    drag._adjustPan(event);
  }
}
