import { updateSun } from './updateSun.js';

/**
 * Switch to live simulation time and refresh sunlight.
 *
 * @param {Object} state Sunlight and time-control state.
 */
export function useLiveTime(state) {
  state.control.live = true;
  updateSun(state);
}
