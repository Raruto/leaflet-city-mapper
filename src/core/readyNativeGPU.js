import { pluginState } from './pluginState.js';
import { nativeLayer } from './nativeLayer.js';

export function readyNativeGPU(state) {
  if (pluginState(state.source)._nativeGPU !== state) return state.source;
  return nativeLayer(state);
}
