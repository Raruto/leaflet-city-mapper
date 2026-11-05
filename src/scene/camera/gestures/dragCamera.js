import { cameraControlsState } from '../controls/constants/cameraControlsState.js';
import { cameraDragDown } from './cameraDragDown.js';
import { cameraDragMove } from './cameraDragMove.js';
import { cameraDragEnd } from './cameraDragEnd.js';
import { cameraDragClick } from './cameraDragClick.js';
import { cameraDragContextMenu } from './cameraDragContextMenu.js';
import { endAllCameraDrags } from './endAllCameraDrags.js';

export function dragCamera(map, element, accept, sensitivity = [0.8, 0.5], orbit = false) {
  const state = { map, element, accept, sensitivity, orbit, drag: null, moved: false };
  cameraControlsState.dragStates.set(element, state);
  cameraControlsState.cameraDrags.add(state);
  element.addEventListener('pointerdown', cameraDragDown, true);
  element.addEventListener('pointermove', cameraDragMove);
  element.addEventListener('pointerup', cameraDragEnd);
  element.addEventListener('pointercancel', cameraDragEnd);
  element.addEventListener('lostpointercapture', cameraDragEnd);
  element.addEventListener('click', cameraDragClick, true);
  element.addEventListener('contextmenu', cameraDragContextMenu);
  window.addEventListener('blur', endAllCameraDrags);
  return state;
}
