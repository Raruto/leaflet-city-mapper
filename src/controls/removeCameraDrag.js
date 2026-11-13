import { dragStates } from '../weakmaps/dragStates.js';
import { cameraDrags } from '../globals/cameraDrags.js';
import { finishCameraDrag } from './finishCameraDrag.js';
import { cameraDragDown } from './cameraDragDown.js';
import { cameraDragMove } from './cameraDragMove.js';
import { cameraDragEnd } from './cameraDragEnd.js';
import { cameraDragClick } from './cameraDragClick.js';
import { cameraDragContextMenu } from './cameraDragContextMenu.js';
import { endAllCameraDrags } from './endAllCameraDrags.js';

export function removeCameraDrag(state) {
  finishCameraDrag(state);
  const { element } = state;
  element.removeEventListener('pointerdown', cameraDragDown, true);
  element.removeEventListener('pointermove', cameraDragMove);
  element.removeEventListener('pointerup', cameraDragEnd);
  element.removeEventListener('pointercancel', cameraDragEnd);
  element.removeEventListener('lostpointercapture', cameraDragEnd);
  element.removeEventListener('click', cameraDragClick, true);
  element.removeEventListener('contextmenu', cameraDragContextMenu);
  dragStates.value.delete(element);
  cameraDrags.value.delete(state);
  if (!cameraDrags.value.size) window.removeEventListener('blur', endAllCameraDrags);
}
