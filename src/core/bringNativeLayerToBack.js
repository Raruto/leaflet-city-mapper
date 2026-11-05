import { sceneByLayer } from '../globals/sceneByLayer.js';

import { reorderNativeLayer } from './reorderNativeLayer.js';

export function bringNativeLayerToBack(layer = this) {
  const native = sceneByLayer.get(layer)?._nativeGPU;
  if (native?.backend && !native.disposed) reorderNativeLayer.call(native, false);
}
