import { finishCameraDrag } from './finishCameraDrag.js';
import { cameraControlsState } from './constants/cameraControlsState.js';

export function cameraDragEnd(event) {
  finishCameraDrag(cameraControlsState.dragStates.get(this), event);
}
