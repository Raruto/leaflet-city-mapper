import { startTraffic } from './startTraffic.js';

/**
 * Mark a traffic layer ready and start it if already attached to a map.
 *
 * @param {Object} state Traffic layer state.
 */
export function readyTraffic(state) {
  state.ready = true;
  if (state.layer._map) startTraffic(state);
}
