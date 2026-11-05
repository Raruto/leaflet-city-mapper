import { toLanes } from '../routes/toLanes.js';
import { prepareTraffic } from '../simulation/prepareTraffic.js';

export function loadedTrafficLanes(state, signal, data) {
  if (signal.aborted || !state.layer._map) return;
  state.error = null;
  if (data === state.loaded) {
    state.nextCheck = -Infinity;
    if (!state.frame) state.tick();
    return;
  }
  state.loaded = data;
  state.lanes = toLanes(data);
  prepareTraffic(state);
  if (!state.frame) state.tick();
}
