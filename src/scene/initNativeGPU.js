import { nativeLayer } from './nativeLayer.js';
import { hideTargets } from './hideTargets.js';
import { removeTargets } from './removeTargets.js';
import { readyNativeGPU } from './readyNativeGPU.js';
import { reportError } from './reportError.js';

export function initNativeGPU(source, map) {
  if (source._nativeGPU) return;
  if (!document.getElementById('leaflet-webgpu-targets')) {
    const style = document.createElement('style');
    style.id = 'leaflet-webgpu-targets';
    style.textContent = '.leaflet-webgpu-target{opacity:0!important}';
    document.head.append(style);
  }
  const state = source._nativeGPU = { source, map, hidden: new Set() };
  state.hide = hideTargets.bind(null, state);
  state.hide();
  source.once('remove', removeTargets.bind(null, state));
  source.ready = Promise.resolve().then(readyNativeGPU.bind(null, state));
  source.ready.catch(reportError.bind(null, source));
}
