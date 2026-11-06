import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';


import { refreshNativeLayer } from './refreshNativeLayer.js';

export function refreshNativeLayerContract(layer = this) {
  const native = nativeGPUByLayer.get(layer);
  if (native?.backend && !native.disposed) refreshNativeLayer(native);
}
