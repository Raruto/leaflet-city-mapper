import { dragStates } from '../weakmaps/dragStates.js';


export function cameraDragContextMenu(event) {
  const state = dragStates.value.get(this);
  if (!state.drag && !state.moved) return;
  event.preventDefault();
  event.stopPropagation();
}
