import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { disposeNativeLayer } from './disposeNativeLayer.js';

export function removeTargets(state) {
  if (nativeGPUByLayer.get(state.source) === state) nativeGPUByLayer.set(state.source, null);
  if (state.backend) disposeNativeLayer.call(state);
  let element;
  for (element of state.hidden) {
    element.classList.remove('leaflet-webgpu-target');
  }
}
