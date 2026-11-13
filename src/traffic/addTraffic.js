import { trafficByLayer } from '../weakmaps/trafficByLayer.js';
import { placeTraffic } from './placeTraffic.js';
import { startTraffic } from './startTraffic.js';

/**
 * Register traffic state on layer addition and start loading if the layer is ready.
 *
 * @param {Object} state Traffic layer state.
 */
export function addTraffic(state) {
  trafficByLayer.set(state.layer, state);
  if (state.ready) startTraffic(state);
}
