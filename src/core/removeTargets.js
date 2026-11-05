import { pluginState } from './pluginState.js';
export function removeTargets(state) {
  if (pluginState(state.source)._nativeGPU === state) pluginState(state.source)._nativeGPU = null;
  state.dispose?.();
  let element;
  for (element of state.hidden) {
    element.classList.remove('leaflet-webgpu-target');
  }
}
