import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';



export function current(state) {
  return nativeGPUByLayer.get(state.source) === state && state.map.hasLayer(state.source);
}
