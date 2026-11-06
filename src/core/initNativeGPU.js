import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { nativeLayer } from './nativeLayer.js';
import { hideTargets } from './hideTargets.js';
import { removeTargets } from './removeTargets.js';
import { readyNativeGPU } from './readyNativeGPU.js';
import { reportError } from '../scene/reportError.js';

export function initNativeGPU(source, map) {
  if (nativeGPUByLayer.get(source)) return;
  if (!document.getElementById('leaflet-webgpu-targets')) {
    const style = document.createElement('style');
    style.id = 'leaflet-webgpu-targets';
    style.textContent = '.leaflet-webgpu-target{opacity:0!important}';
    document.head.append(style);
  }
  const state = mutateWeakMap(nativeGPUByLayer, source, "=", /* alloc */ {
    source, map, hidden: /* alloc */ new Set(),
  });
  hideTargets(state);
  source.once('remove', removeTargets.bind(null, state));
  mutateWeakMap(readyByLayer, source, "=", Promise.resolve().then(readyNativeGPU.bind(null, state)));
  readyByLayer.get(source).catch(reportError.bind(null, source));
}
