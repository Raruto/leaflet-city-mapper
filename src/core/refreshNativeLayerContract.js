import { sceneByLayer } from '../globals/sceneByLayer.js';

import { refreshNativeLayer } from './refreshNativeLayer.js';

export function refreshNativeLayerContract(layer = this) {
  const native = sceneByLayer.get(layer)?._nativeGPU;
  if (native?.backend && !native.disposed) refreshNativeLayer(native);
}
