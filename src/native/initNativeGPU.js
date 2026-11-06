import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';



import { nativeLayer } from './nativeLayer.js';
import { hideTargets } from './hideTargets.js';
import { removeTargets } from './removeTargets.js';
import { readyNativeGPU } from './readyNativeGPU.js';
import { reportError } from '../scene/reportLayerError.js';

export function initNativeGPU(source, map) {
  if (nativeGPUByLayer.get(source)) return;
  if (!document.getElementById('leaflet-webgpu-targets')) {
    const style = document.createElement('style');
    style.id = 'leaflet-webgpu-targets';
    style.textContent = '.leaflet-webgpu-target{opacity:0!important}';
    document.head.append(style);
  }
  const state = /* alloc */ {
    source, map, hidden: /* alloc */ new Set(),
  };
  nativeGPUByLayer.set(source, state);
  hideTargets(state);
  source.once('remove', removeTargets.bind(null, state));
  readyByLayer.set(source, Promise.resolve().then(readyNativeGPU.bind(null, state)));
  readyByLayer.get(source).catch(reportError.bind(null, source));
}
