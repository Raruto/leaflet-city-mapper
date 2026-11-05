import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { endCameraTouch } from './endCameraTouch.js';
import { startCameraTouch } from './startCameraTouch.js';
import { moveCameraTouch } from './moveCameraTouch.js';
import { endCameraTouchEvent } from './endCameraTouchEvent.js';

import { endAllCameraTouches } from './endAllCameraTouches.js';
import { changeCameraTouch } from './changeCameraTouch.js';

export function cleanupCameraTouch() {
  const state = pluginState(this)._cameraTouchState;
  if (!state) return;
  const { container, map } = state;
  endCameraTouch(state);
  container.removeEventListener('touchstart', startCameraTouch, true);
  container.removeEventListener('touchmove', moveCameraTouch, true);
  container.removeEventListener('touchend', endCameraTouchEvent, true);
  container.removeEventListener('touchcancel', endCameraTouchEvent, true);
  sharedState.cameraTouchStates.delete(state);
  if (!sharedState.cameraTouchStates.size) window.removeEventListener('blur', endAllCameraTouches);
  map.off('cameratouchchange', changeCameraTouch, map);
  pluginState(map).rotateControl?.remove();
  delete pluginState(container)._cameraTouchState;
  delete pluginState(map)._cameraTouchState;
}
