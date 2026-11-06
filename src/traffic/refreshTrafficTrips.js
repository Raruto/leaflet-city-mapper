import { tripsAt } from './tripsAt.js';
import { failTraffic } from './failTraffic.js';
import { drawTrafficRoute } from './drawTrafficRoute.js';
import { rebuildTrafficMesh } from './rebuildTrafficMesh.js';
import { rebaseTraffic } from './rebaseTraffic.js';
import { trafficStatusText } from './trafficStatusText.js';

export function refreshTrafficTrips(state, time, ms, valid) {
  let text;
  try {
    if (valid) state.trips = tripsAt(time, state.lanes, state.velocity);
    else state.trips.length = 0;
    text = trafficStatusText(state, valid);
  } catch (error) {
    failTraffic(state, error);
    return;
  }
  state.rebasedAt = ms;
  state.nextCheck = ms + 1000;
  let key = '', trip;
  for (trip of state.trips) key += `${key ? ',' : ''}${trip.id}`;
  const routeNeeded = state.outline && !state.route && state.lanes.length;
  const changed = key !== state.tripsKey || Boolean(routeNeeded);
  if (routeNeeded) drawTrafficRoute(state);
  if (key !== state.tripsKey) { rebuildTrafficMesh(state); state.tripsKey = key; }
  if (state.mesh) rebaseTraffic(state);
  if (!state.error) {
    if (state.status.textContent !== text) state.status.textContent = text;
    state.status.removeAttribute('role');
  }
  return changed;
}
