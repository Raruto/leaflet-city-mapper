import { dragStates } from '../weakmaps/dragStates.js';

export function cameraDragClick(event) {
  const state = dragStates.value.get(this);
  if (!state.moved) return;
  event.preventDefault();
  event.stopPropagation();
  state.moved = false;
}
