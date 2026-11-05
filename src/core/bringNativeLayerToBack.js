import { pluginState } from './pluginState.js';
export function bringNativeLayerToBack(layer = this) {
  pluginState(layer)?._nativeGPU?.reorder?.(false);
}
