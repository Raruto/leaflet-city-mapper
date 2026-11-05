import { nativeLayerState } from '../constants/nativeLayerState.js';

export function removeImageState(image, state) {
  const states = nativeLayerState.imageStates.get(image);
  if (!states) return;
  states.delete(state);
  if (!states.size) nativeLayerState.imageStates.delete(image);
}
