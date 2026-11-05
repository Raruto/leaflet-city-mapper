import { refreshNativeLayer } from './refreshNativeLayer.js';

export function reorderNativeLayer(front) {
  this.order = front ? ++this.map._nativeGPUOrder : --this.map._nativeGPUBack;
  refreshNativeLayer(this);
}
