import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';


import { reorderNativeLayer } from './reorderNativeLayer.js';

export function bringNativeLayerToFront(layer = this) {
  const native = nativeGPUByLayer.get(layer);
  if (native?.backend && !native.disposed) reorderNativeLayer.call(native, true);
}
