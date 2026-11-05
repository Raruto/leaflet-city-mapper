import { cameraControlsState } from '../controls/constants/cameraControlsState.js';
import { endCameraTouch } from './endCameraTouch.js';

export function endAllCameraTouches() {
  for (const state of cameraControlsState.cameraTouchStates) endCameraTouch(state);
}
