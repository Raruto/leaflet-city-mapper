import { state as sharedState } from '../state.js';
import { finishCameraDrag } from './finishCameraDrag.js';

export function cameraDragEnd(event) {
  finishCameraDrag(sharedState.dragStates.get(this), event);
}
