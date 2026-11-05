import { cameraControlsState } from '../constants/cameraControlsState.js';

export function cameraDragClick(event) {
  const state = cameraControlsState.dragStates.get(this);
  if (!state.moved) return;
  event.preventDefault();
  event.stopPropagation();
  state.moved = false;
}
