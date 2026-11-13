import { tripsAt } from './tripsAt.js';
import { failTraffic } from './failTraffic.js';
import { drawTrafficRoute } from './drawTrafficRoute.js';
import { rebuildTrafficMesh } from './rebuildTrafficMesh.js';
import { rebaseTraffic } from './rebaseTraffic.js';
import { trafficStatusText } from './trafficStatusText.js';

/**
 * Recompute scheduled trips and status, rebuilding changed geometry and rebasing GPU data.
 *
 * @param {Object} state Traffic layer state.
 * @param {Date|undefined} time Simulation time, if available.
 * @param {number|undefined} ms Simulation timestamp in milliseconds, if available.
 * @param {boolean} valid Whether the simulation timestamp is valid.
 *
 * @returns {boolean|undefined} Whether geometry changed, or undefined if updating trips failed.
 */
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
