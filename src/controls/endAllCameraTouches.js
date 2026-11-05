import { cameraTouchStates } from '../globals/cameraTouchStates.js';


import { endCameraTouch } from './endCameraTouch.js';

export function endAllCameraTouches() {
  let state;
  for (state of cameraTouchStates) endCameraTouch(state);
}
