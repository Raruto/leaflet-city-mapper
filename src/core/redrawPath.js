import { refreshNativeLayerContract } from '../native/refreshNativeLayerContract.js';

/**
 * Refresh this native path's GPU rendering.
 *
 * @returns {L.Path} This path.
 */
export function redrawPath() {
  refreshNativeLayerContract(this);
  return this;
}
