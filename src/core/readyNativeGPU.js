import { sceneByLayer } from '../globals/sceneByLayer.js';


import { nativeLayer } from './nativeLayer.js';

export function readyNativeGPU(state) {
  if (sceneByLayer.get(state.source)._nativeGPU !== state) return state.source;
  return nativeLayer(state);
}
