import { sceneByLayer } from '../globals/sceneByLayer.js';


export function current(state) {
  return sceneByLayer.get(state.source)._nativeGPU === state && state.map.hasLayer(state.source);
}
