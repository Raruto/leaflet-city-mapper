import { nativeLayerState } from '../constants/nativeLayerState.js';

export function addImageState(image, state) {
  let states = nativeLayerState.imageStates.get(image);
  if (!states) nativeLayerState.imageStates.set(image, states = new Set());
  states.add(state);
}
