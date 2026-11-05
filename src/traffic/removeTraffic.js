import { disposeTrafficObject } from './disposeTrafficObject.js';
import { destroyTrafficGpu } from './destroyTrafficGpu.js';

export function removeTraffic(state) {
  state.request?.abort();
  cancelAnimationFrame(state.frame);
  state.frame = undefined;
  state.layer._map.off('simulationtimechange layerremove', state.update).off('terrainchange', state.terrain);
  disposeTrafficObject(state, state.mesh);
  disposeTrafficObject(state, state.route);
  state.mesh = state.route = null;
  delete state.layer._beforeRaycast;
  destroyTrafficGpu(state);
  state.lanes = [];
  state.trips = [];
  state.tripsKey = state.loaded = null;
}
