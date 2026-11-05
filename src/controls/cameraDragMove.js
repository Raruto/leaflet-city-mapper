import { cameraControlsState } from '../constants/cameraControlsState.js';

export function cameraDragMove(event) {
  const state = cameraControlsState.dragStates.get(this);
  if (!state.drag || state.drag.id !== event.pointerId) return;
  const x = event.clientX - state.drag.x, y = event.clientY - state.drag.y;
  if (Math.hypot(x, y) < 3 && !state.moved) return;
  state.map._stopPitchBearingAnimation();
  state.moved = true;
  event.preventDefault();
  let bearing = x * state.sensitivity[0];
  if (state.orbit) {
    if (Math.abs(state.drag.cy - state.drag.y) > 100) {
      const angle = Math.atan2(event.clientY - state.drag.cy, event.clientX - state.drag.cx) -
        Math.atan2(event.clientY - state.drag.cy, state.drag.x - state.drag.cx);
      bearing = Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI;
    } else bearing *= event.clientY < state.drag.cy ? 1 : -1;
  }
  state.map._setPitchAndBearing(state.map.getPitch() - y * state.sensitivity[1],
    state.map.getBearing() + bearing);
  state.drag.x = event.clientX;
  state.drag.y = event.clientY;
}
