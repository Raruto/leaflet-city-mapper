import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { nativeLayer } from './nativeLayer.js';

export function readyNativeGPU(state) {
  if (nativeGPUByLayer.get(state.source) !== state) return state.source;
  return nativeLayer(state);
}
