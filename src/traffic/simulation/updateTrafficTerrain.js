import { disposeTrafficObject } from '../rendering/disposeTrafficObject.js';
import { groundTraffic } from './groundTraffic.js';
import { trafficBounds } from '../routes/trafficBounds.js';

export function updateTrafficTerrain(state) {
  if (!state.lanes.length) return;
  groundTraffic(state);
  disposeTrafficObject(state, state.route);
  state.route = null;
  if (state.mesh) trafficBounds(state);
  if (!state.frame) state.tick();
}
