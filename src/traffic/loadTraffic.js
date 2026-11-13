import { trafficNow } from './trafficNow.js';
import { fetchTrafficLanes } from './fetchTrafficLanes.js';
import { loadedTrafficLanes } from './loadedTrafficLanes.js';
import { failedTrafficLoad } from './failedTrafficLoad.js';

/**
 * Cancel the previous lane request and load lanes for the current valid simulation time.
 *
 * @param {Object} state Traffic layer state.
 */
export function loadTraffic(state) {
  const { time } = trafficNow(state);
  if (!Number.isFinite(time?.getTime())) return;
  state.request?.abort();
  const { signal } = state.request = /* alloc */ new AbortController();
  fetchTrafficLanes(state, time, signal).then(
    loadedTrafficLanes.bind(null, state, signal),
    failedTrafficLoad.bind(null, state, signal),
  );
}
