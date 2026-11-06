import { degrees } from '../globals/degrees.js';
import { dragStates } from '../weakmaps/dragStates.js';

import { mapStopPitchBearingAnimation } from '../camera/mapStopPitchBearingAnimation.js';
import { mapSetPitchAndBearing } from '../camera/mapSetPitchAndBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

export function cameraDragMove(event) {
  const state = dragStates.value.get(this);
  if (!state.drag || state.drag.id !== event.pointerId) return;
  const x = event.clientX - state.drag.x, y = event.clientY - state.drag.y;
  if (Math.hypot(x, y) < 3 && !state.moved) return;
  mapStopPitchBearingAnimation(state.map);
  state.moved = true;
  event.preventDefault();
  let bearing = x * state.sensitivity[0];
  if (state.orbit) {
    if (Math.abs(state.drag.cy - state.drag.y) > 100) {
      const angle = Math.atan2(event.clientY - state.drag.cy, event.clientX - state.drag.cx) -
        Math.atan2(event.clientY - state.drag.cy, state.drag.x - state.drag.cx);
      bearing = Math.atan2(Math.sin(angle), Math.cos(angle)) * degrees;
    } else bearing *= event.clientY < state.drag.cy ? 1 : -1;
  }
  mapSetPitchAndBearing(state.map, mapGetPitch(state.map) - y * state.sensitivity[1], mapGetBearing(state.map) + bearing);
  state.drag.x = event.clientX;
  state.drag.y = event.clientY;
}
