import { pluginState } from './pluginState.js';
import { nativeLayer } from './nativeLayer.js';
import { hideTargets } from './hideTargets.js';
import { removeTargets } from './removeTargets.js';
import { readyNativeGPU } from './readyNativeGPU.js';
import { reportError } from '../scene/reportError.js';

export function initNativeGPU(source, map) {
  if (pluginState(source)._nativeGPU) return;
  if (!document.getElementById('leaflet-webgpu-targets')) {
    const style = document.createElement('style');
    style.id = 'leaflet-webgpu-targets';
    style.textContent = '.leaflet-webgpu-target{opacity:0!important}';
    document.head.append(style);
  }
  const state = pluginState(source)._nativeGPU = /* allocation: required -- Each native layer owns its asynchronous renderer lifecycle. */ {
    source, map, hidden: /* allocation: required -- Hidden DOM targets are tracked independently for each layer's cleanup. */ new Set(),
  };
  state.hide = hideTargets.bind(null, state);
  state.hide();
  source.once('remove', removeTargets.bind(null, state));
  pluginState(source).ready = Promise.resolve().then(readyNativeGPU.bind(null, state));
  pluginState(source).ready.catch(reportError.bind(null, source));
}
