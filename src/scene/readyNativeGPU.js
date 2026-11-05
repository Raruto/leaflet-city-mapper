import { nativeLayer } from './nativeLayer.js';

export function readyNativeGPU(state) {
  if (state.source._nativeGPU !== state) return state.source;
  return nativeLayer(state);
}
