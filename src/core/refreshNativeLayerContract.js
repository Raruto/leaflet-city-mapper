import { pluginState } from './pluginState.js';
export function refreshNativeLayerContract(layer = this) {
  pluginState(layer)?._nativeGPU?.refresh?.();
}
