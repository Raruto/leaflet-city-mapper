import { pendingMarkerPan } from '../globals/pendingMarkerPan.js';
import { markerPanFrame } from '../globals/markerPanFrame.js';
import { runMarkerPanFrame } from './runMarkerPanFrame.js';

/**
 * Queue the latest marker drag event for the shared pan frame.
 *
 * @param {Object} drag Leaflet marker drag handler.
 * @param {Object} event Drag event passed to the pan adjustment.
 */
export function scheduleMarkerPan(drag, event) {
  pendingMarkerPan.set(drag, event);
  if (markerPanFrame.value === null) markerPanFrame.value = requestAnimationFrame(runMarkerPanFrame);
  drag._panRequest = markerPanFrame.value;
}
