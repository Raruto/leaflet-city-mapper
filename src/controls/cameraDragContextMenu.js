import { dragStates } from '../weakmaps/dragStates.js';

/**
 * Suppress the context menu while or after a camera drag.
 *
 * @param {MouseEvent} event Context-menu event.
 */
export function cameraDragContextMenu(event) {
  const state = dragStates.value.get(this);
  if (!state.drag && !state.moved) return;
  event.preventDefault();
  event.stopPropagation();
}
