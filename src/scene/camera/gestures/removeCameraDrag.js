import { finishCameraDrag } from './finishCameraDrag.js';
import { cameraDragDown } from './cameraDragDown.js';
import { cameraDragMove } from './cameraDragMove.js';
import { cameraDragEnd } from './cameraDragEnd.js';
import { cameraDragClick } from './cameraDragClick.js';
import { cameraDragContextMenu } from './cameraDragContextMenu.js';
import { cameraControlsState } from '../controls/constants/cameraControlsState.js';
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
  cameraControlsState.dragStates.delete(element);
  cameraControlsState.cameraDrags.delete(state);
  if (!cameraControlsState.cameraDrags.size) window.removeEventListener('blur', endAllCameraDrags);
}
