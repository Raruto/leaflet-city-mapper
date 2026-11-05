import { pluginState } from './pluginState.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export function reorderNativeLayer(front) {
  this.order = front ? ++pluginState(this.map)._nativeGPUOrder : --pluginState(this.map)._nativeGPUBack;
  refreshNativeLayer(this);
}
