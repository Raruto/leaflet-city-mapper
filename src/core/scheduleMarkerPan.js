import { state as sharedState } from '../state.js';

import { runMarkerPanFrame } from './runMarkerPanFrame.js';

export function scheduleMarkerPan(drag, event) {
  sharedState.pendingMarkerPan.set(drag, event);
  if (sharedState.markerPanFrame === null) sharedState.markerPanFrame = requestAnimationFrame(runMarkerPanFrame);
  drag._panRequest = sharedState.markerPanFrame;
}
