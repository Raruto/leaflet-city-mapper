import { pluginState } from '../core/pluginState.js';
import { placeTraffic } from './placeTraffic.js';
import { startTraffic } from './startTraffic.js';

export function addTraffic(state) {
  pluginState(state.layer)._beforeRaycast = placeTraffic.bind(null, state);
  if (state.ready) startTraffic(state);
}
