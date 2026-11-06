import { trafficByLayer } from '../weakmaps/trafficByLayer.js';


import { placeTraffic } from './placeTraffic.js';
import { startTraffic } from './startTraffic.js';

export function addTraffic(state) {
  trafficByLayer.set(state.layer, state);
  if (state.ready) startTraffic(state);
}
