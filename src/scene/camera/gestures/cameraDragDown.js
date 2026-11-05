import { cameraControlsState } from '../controls/constants/cameraControlsState.js';
import { editable } from './editable.js';

export function cameraDragDown(event) {
  const state = cameraControlsState.dragStates.get(this);
  if (state.drag || !state.accept(event) || editable(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  state.moved = false;
  const rect = state.map.getContainer().getBoundingClientRect();
  state.drag = {
    id: event.pointerId, x: event.clientX, y: event.clientY, cursor: state.element.style.cursor,
    cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2,
    dragging: state.map.dragging?.enabled(),
  };
  state.map.dragging?.disable();
  state.element.focus?.({ preventScroll: true });
  state.element.setPointerCapture(event.pointerId);
  state.element.style.cursor = 'grabbing';
}
