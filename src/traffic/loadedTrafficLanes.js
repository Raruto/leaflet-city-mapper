import { toLanes } from './featuresToTrafficLanes.js';
import { prepareTraffic } from './prepareTraffic.js';

/**
 * Apply loaded lanes unless cancelled or detached, preparing new data and restarting traffic updates.
 *
 * @param {Object} state Traffic layer state.
 * @param {AbortSignal} signal Signal for the completed request.
 * @param {Object} data Loaded GeoJSON data.
 */
export function loadedTrafficLanes(state, signal, data) {
  if (signal.aborted || !state.layer._map) return;
  state.error = null;
  if (data === state.loaded) {
    state.nextCheck = -Infinity;
    if (!state.frame) state.tick();
    return;
  }
  state.loaded = data;
  state.lanes = toLanes(data);
  prepareTraffic(state);
  if (!state.frame) state.tick();
}
