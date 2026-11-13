import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

/**
 * Refresh a layer's native backend if it is active.
 *
 * @param {Object} layer Source layer, defaulting to the bound context.
 */
export function refreshNativeLayerContract(layer = this) {
  const native = nativeGPUByLayer.get(layer);
  if (native?.backend && !native.disposed) refreshNativeLayer(native);
}
