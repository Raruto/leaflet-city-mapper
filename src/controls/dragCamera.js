import { cameraDragSensitivity } from '../globals/cameraDragSensitivity.js';
import { dragStates } from '../weakmaps/dragStates.js';
import { cameraDrags } from '../globals/cameraDrags.js';


import { cameraDragDown } from './cameraDragDown.js';
import { cameraDragMove } from './cameraDragMove.js';
import { cameraDragEnd } from './cameraDragEnd.js';
import { cameraDragClick } from './cameraDragClick.js';
import { cameraDragContextMenu } from './cameraDragContextMenu.js';
import { endAllCameraDrags } from './endAllCameraDrags.js';

export function dragCamera(map, element, accept, sensitivity = cameraDragSensitivity, orbit = false) {
  const state = /* alloc */ { map, element, accept, sensitivity, orbit, drag: null, moved: false };
  dragStates.value.set(element, state);
  cameraDrags.value.add(state);
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
