import { pluginState } from '../core/pluginState.js';

export function ready(instance) {
  const state = pluginState(instance);
  return state.ready || state.cameraReady || Promise.resolve(instance);
}
