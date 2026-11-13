import { timeControlByMap } from '../weakmaps/timeControlByMap.js';

/**
 * Return the selected simulation time, or the current time when the map clock is live.
 *
 * @param {Object} state Traffic layer state.
 *
 * @returns {Object} Live-mode flag and selected time.
 */
export function trafficNow(state) {
  const control = timeControlByMap.get(state.layer._map);
  const live = control ? control.live : true;
  return /* alloc */ {
    live, time: live ? /* alloc */ new Date() : control.time,
  };
}
