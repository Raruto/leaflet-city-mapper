import { state as sharedState } from '../state.js';

export function removeImageState(image, state) {
  const states = sharedState.imageStates.get(image);
  if (!states) return;
  states.delete(state);
  if (!states.size) sharedState.imageStates.delete(image);
}
