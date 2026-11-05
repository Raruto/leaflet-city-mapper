import { state as sharedState } from '../state.js';

export function addImageState(image, state) {
  let states = sharedState.imageStates.get(image);
  if (!states) sharedState.imageStates.set(image, states = /* allocation: required -- Each image tracks the layer owners to unregister when it is released. */ new Set());
  states.add(state);
}
