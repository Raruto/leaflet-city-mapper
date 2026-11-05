import { state as sharedState } from '../state.js';

import { endCameraTouch } from './endCameraTouch.js';

export function endAllCameraTouches() {
  let state;
  for (state of sharedState.cameraTouchStates) endCameraTouch(state);
}
