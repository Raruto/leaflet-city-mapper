import { nativeLayer } from './nativeLayer.js';

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

function hideTargets(state) {
  const { source } = state;
  const htmlIcon = source instanceof L.Marker && source.options.icon instanceof L.DivIcon;
  const targets = [htmlIcon ? null : source._icon, htmlIcon ? null : source._shadow];
  for (const element of state.hidden) {
    if (targets.includes(element)) continue;
    element.classList.remove('leaflet-webgpu-target');
    state.hidden.delete(element);
  }
  for (const element of targets) {
    if (!element || state.hidden.has(element)) continue;
    element.classList.add('leaflet-webgpu-target');
    state.hidden.add(element);
  }
}

function removeTargets(state) {
  if (state.source._nativeGPU === state) state.source._nativeGPU = null;
  state.dispose?.();
  for (const element of state.hidden) {
    element.classList.remove('leaflet-webgpu-target');
  }
}

function readyNativeGPU(state) {
  if (state.source._nativeGPU !== state) return state.source;
  return nativeLayer(state);
}

function reportError(source, error) {
  source.fire('error', { error });
}
