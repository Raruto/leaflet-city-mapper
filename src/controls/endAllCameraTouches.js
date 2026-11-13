import { cameraTouchStates } from '../globals/cameraTouchStates.js';
import { endCameraTouch } from './endCameraTouch.js';

/** End all active camera touch gestures. */
export function endAllCameraTouches() {
  let state;
  for (state of cameraTouchStates) endCameraTouch(state);
}
