import { dragStates } from '../weakmaps/dragStates.js';

/**
 * Suppress the click following a camera drag.
 *
 * @param {MouseEvent} event Click event.
 */
export function cameraDragClick(event) {
  const state = dragStates.value.get(this);
  if (!state.moved) return;
  event.preventDefault();
  event.stopPropagation();
  state.moved = false;
}
