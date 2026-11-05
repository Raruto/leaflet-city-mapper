import { placeTraffic } from '../simulation/placeTraffic.js';
import { startTraffic } from './startTraffic.js';

export function addTraffic(state) {
  state.layer._beforeRaycast = placeTraffic.bind(null, state);
  if (state.ready) startTraffic(state);
}
