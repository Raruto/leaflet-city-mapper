import { cameraControlsState } from '../constants/cameraControlsState.js';
import { endCameraTouch } from './endCameraTouch.js';

export function endAllCameraTouches() {
  let state;
  for (state of cameraControlsState.cameraTouchStates) endCameraTouch(state);
}
