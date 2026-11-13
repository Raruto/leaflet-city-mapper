import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { nativeLayer } from './nativeLayer.js';

/**
 * Start native rendering only if the layer state is still current.
 *
 * @param {Object} state Native layer state.
 *
 * @returns {Object|Promise<Object>} The source layer or its initialization promise.
 */
export function readyNativeGPU(state) {
  if (nativeGPUByLayer.get(state.source) !== state) return state.source;
  return nativeLayer(state);
}
