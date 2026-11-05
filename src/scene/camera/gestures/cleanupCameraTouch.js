import { endCameraTouch } from './endCameraTouch.js';
import { startCameraTouch } from './startCameraTouch.js';
import { moveCameraTouch } from './moveCameraTouch.js';
import { endCameraTouchEvent } from './endCameraTouchEvent.js';
import { cameraControlsState } from '../controls/constants/cameraControlsState.js';
import { endAllCameraTouches } from './endAllCameraTouches.js';
import { changeCameraTouch } from './changeCameraTouch.js';

export function cleanupCameraTouch() {
  const state = this._cameraTouchState;
  if (!state) return;
  const { container, map } = state;
  endCameraTouch(state);
  container.removeEventListener('touchstart', startCameraTouch, true);
  container.removeEventListener('touchmove', moveCameraTouch, true);
  container.removeEventListener('touchend', endCameraTouchEvent, true);
  container.removeEventListener('touchcancel', endCameraTouchEvent, true);
  cameraControlsState.cameraTouchStates.delete(state);
  if (!cameraControlsState.cameraTouchStates.size) window.removeEventListener('blur', endAllCameraTouches);
  map.off('cameratouchchange', changeCameraTouch, map);
  map.rotateControl?.remove();
  delete container._cameraTouchState;
  delete map._cameraTouchState;
}
