import { pluginState } from './pluginState.js';
export function bringNativeLayerToFront(layer = this) {
  pluginState(layer)?._nativeGPU?.reorder?.(true);
}
