import { cameraControlsState } from '../constants/cameraControlsState.js';

export function cameraDragContextMenu(event) {
  const state = cameraControlsState.dragStates.get(this);
  if (!state.drag && !state.moved) return;
  event.preventDefault();
  event.stopPropagation();
}
