import { updateSun } from './updateSun.js';

/**
 * Refresh sunlight on the timer only while the control uses live time.
 *
 * @param {Object} state Sunlight and time-control state.
 */
export function tickSun(state) {
  if (state.control.live) updateSun(state);
}
