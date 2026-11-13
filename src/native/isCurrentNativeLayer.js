import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';

/**
 * Check whether this state still belongs to a layer present on its map.
 *
 * @param {Object} state Native layer state.
 *
 * @returns {boolean} Whether the state is current.
 */
export function current(state) {
  return nativeGPUByLayer.get(state.source) === state && state.map.hasLayer(state.source);
}
