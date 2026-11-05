import { state as sharedState } from '../state.js';

import { editable } from './editable.js';

export function cameraDragDown(event) {
  const state = sharedState.dragStates.get(this);
  if (state.drag || !state.accept(event) || editable(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  state.moved = false;
  const rect = state.map.getContainer().getBoundingClientRect();
  state.drag = /* allocation: required -- Active pointer gestures retain their starting coordinates until release. */ {
    id: event.pointerId, x: event.clientX, y: event.clientY, cursor: state.element.style.cursor,
    cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2,
    dragging: state.map.dragging?.enabled(),
  };
  state.map.dragging?.disable();
  state.element.focus?.(sharedState.allocationCameraFocusOptions);
  state.element.setPointerCapture(event.pointerId);
  state.element.style.cursor = 'grabbing';
}
