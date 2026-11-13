import { trafficByLayer } from '../weakmaps/trafficByLayer.js';
import { disposeTrafficObject } from './disposeTrafficObject.js';
import { destroyTrafficGpu } from './destroyTrafficGpu.js';

/**
 * Abort loading, unregister listeners and release traffic meshes, GPU resources and lane state.
 *
 * @param {Object} state Traffic layer state.
 */
export function removeTraffic(state) {
  state.request?.abort();
  cancelAnimationFrame(state.frame);
  state.frame = undefined;
  state.layer._map.off('simulationtimechange layerremove', state.update).off('terrainchange', state.terrain);
  disposeTrafficObject(state, state.mesh);
  disposeTrafficObject(state, state.route);
  state.mesh = state.route = null;
  trafficByLayer.delete(state.layer);
  destroyTrafficGpu(state);
  state.lanes.length = 0;
  state.trips.length = 0;
  state.tripsKey = state.loaded = null;
}
