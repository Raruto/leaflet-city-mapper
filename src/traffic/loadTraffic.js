import { trafficNow } from './trafficNow.js';
import { fetchTrafficLanes } from './fetchTrafficLanes.js';
import { loadedTrafficLanes } from './loadedTrafficLanes.js';
import { failedTrafficLoad } from './failedTrafficLoad.js';

export function loadTraffic(state) {
  const { time } = trafficNow(state);
  if (!Number.isFinite(time?.getTime())) return;
  state.request?.abort();
  const { signal } = state.request = /* allocation: required -- Each replacement lane request needs independently cancellable state. */ new AbortController();
  fetchTrafficLanes(state, time, signal).then(
    loadedTrafficLanes.bind(null, state, signal),
    failedTrafficLoad.bind(null, state, signal),
  );
}
