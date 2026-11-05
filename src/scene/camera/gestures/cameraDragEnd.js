import { finishCameraDrag } from './finishCameraDrag.js';
import { cameraControlsState } from '../controls/constants/cameraControlsState.js';

export function cameraDragEnd(event) {
  finishCameraDrag(cameraControlsState.dragStates.get(this), event);
}
