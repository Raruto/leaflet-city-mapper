import { cameraControlsState } from '../controls/constants/cameraControlsState.js';
import { finishCameraDrag } from './finishCameraDrag.js';

export function endAllCameraDrags() {
  for (const state of cameraControlsState.cameraDrags) finishCameraDrag(state);
}
