import { state as sharedState } from '../state.js';

export function cameraDragContextMenu(event) {
  const state = sharedState.dragStates.get(this);
  if (!state.drag && !state.moved) return;
  event.preventDefault();
  event.stopPropagation();
}
