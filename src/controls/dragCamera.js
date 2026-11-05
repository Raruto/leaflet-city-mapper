import { state as sharedState } from '../state.js';

import { cameraDragDown } from './cameraDragDown.js';
import { cameraDragMove } from './cameraDragMove.js';
import { cameraDragEnd } from './cameraDragEnd.js';
import { cameraDragClick } from './cameraDragClick.js';
import { cameraDragContextMenu } from './cameraDragContextMenu.js';
import { endAllCameraDrags } from './endAllCameraDrags.js';

export function dragCamera(map, element, accept, sensitivity = sharedState.allocationCameraDragSensitivity, orbit = false) {
  const state = /* allocation: required -- Each draggable element retains independent pointer and lifecycle state. */ { map, element, accept, sensitivity, orbit, drag: null, moved: false };
  sharedState.dragStates.set(element, state);
  sharedState.cameraDrags.add(state);
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
