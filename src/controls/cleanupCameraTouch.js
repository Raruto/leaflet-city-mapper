import { cameraTouchStateByMap } from '../weakmaps/cameraTouchStateByMap.js';
import { rotateControlByMap } from '../weakmaps/rotateControlByMap.js';
import { cameraTouchStates } from '../globals/cameraTouchStates.js';
import { touchByContainer } from '../weakmaps/touchByContainer.js';
import { endCameraTouch } from './endCameraTouch.js';
import { startCameraTouch } from './startCameraTouch.js';
import { moveCameraTouch } from './moveCameraTouch.js';
import { endCameraTouchEvent } from './endCameraTouchEvent.js';
import { endAllCameraTouches } from './endAllCameraTouches.js';
import { changeCameraTouch } from './changeCameraTouch.js';

export function cleanupCameraTouch() {
  const state = cameraTouchStateByMap.get(this);
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
  rotateControlByMap.get(map)?.remove();
  touchByContainer.delete(container);
  cameraTouchStateByMap.delete(map);
}
