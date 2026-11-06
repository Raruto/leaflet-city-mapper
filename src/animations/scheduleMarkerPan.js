import { pendingMarkerPan } from '../globals/pendingMarkerPan.js';
import { markerPanFrame } from '../globals/markerPanFrame.js';


import { runMarkerPanFrame } from './runMarkerPanFrame.js';

export function scheduleMarkerPan(drag, event) {
  pendingMarkerPan.set(drag, event);
  if (markerPanFrame.value === null) markerPanFrame.value = requestAnimationFrame(runMarkerPanFrame);
  drag._panRequest = markerPanFrame.value;
}
