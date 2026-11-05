import { cameraControlsState } from '../constants/cameraControlsState.js';
import { finishCameraDrag } from './finishCameraDrag.js';

export function endAllCameraDrags() {
  let state;
  for (state of cameraControlsState.cameraDrags) finishCameraDrag(state);
}
