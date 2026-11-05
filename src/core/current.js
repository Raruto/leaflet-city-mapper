import { pluginState } from './pluginState.js';
export function current(state) {
  return pluginState(state.source)._nativeGPU === state && state.map.hasLayer(state.source);
}
