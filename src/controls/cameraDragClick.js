import { state as sharedState } from '../state.js';

export function cameraDragClick(event) {
  const state = sharedState.dragStates.get(this);
  if (!state.moved) return;
  event.preventDefault();
  event.stopPropagation();
  state.moved = false;
}
