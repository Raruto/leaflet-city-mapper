import { cameraByMap } from '../globals/cameraByMap.js';
import { cameraTouchStates } from '../globals/cameraTouchStates.js';
import { touchByContainer } from '../globals/touchByContainer.js';


import { endCameraTouch } from './endCameraTouch.js';
import { startCameraTouch } from './startCameraTouch.js';
import { moveCameraTouch } from './moveCameraTouch.js';
import { endCameraTouchEvent } from './endCameraTouchEvent.js';

import { endAllCameraTouches } from './endAllCameraTouches.js';
import { changeCameraTouch } from './changeCameraTouch.js';

export function cleanupCameraTouch() {
  const state = cameraByMap.get(this)._cameraTouchState;
  if (!state) return;
  const { container, map } = state;
  endCameraTouch(state);
  container.removeEventListener('touchstart', startCameraTouch, true);
  container.removeEventListener('touchmove', moveCameraTouch, true);
  container.removeEventListener('touchend', endCameraTouchEvent, true);
  container.removeEventListener('touchcancel', endCameraTouchEvent, true);
  cameraTouchStates.delete(state);
  if (!cameraTouchStates.size) window.removeEventListener('blur', endAllCameraTouches);
  map.off('cameratouchchange', changeCameraTouch, map);
  cameraByMap.get(map).rotateControl?.remove();
  touchByContainer.delete(container);
  delete cameraByMap.get(map)._cameraTouchState;
}
