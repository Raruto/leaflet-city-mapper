import { startTraffic } from './startTraffic.js';

export function readyTraffic(state) {
  state.ready = true;
  if (state.layer._map) startTraffic(state);
}
