import { sceneByLayer } from '../globals/sceneByLayer.js';

import { disposeNativeLayer } from './disposeNativeLayer.js';

export function removeTargets(state) {
  if (sceneByLayer.get(state.source)._nativeGPU === state) sceneByLayer.get(state.source)._nativeGPU = null;
  if (state.backend) disposeNativeLayer.call(state);
  let element;
  for (element of state.hidden) {
    element.classList.remove('leaflet-webgpu-target');
  }
}
