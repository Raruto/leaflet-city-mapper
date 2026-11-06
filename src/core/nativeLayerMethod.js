import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { nativeGPUBackByMap } from '../weakmaps/nativeGPUBackByMap.js';
import { nativeGPUOrderByMap } from '../weakmaps/nativeGPUOrderByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';


import { L } from '../globals/L.js';


import { refreshNativeLayer } from './refreshNativeLayer.js';

export function nativeLayerMethod(name, source, args) {
  const state = nativeGPUByLayer.get(source), original = state.originalMethods.get(name);
  const result = original.apply(source, args);
  let layer, zIndex;
  if ((name === 'bringToFront' || name === 'bringToBack') && source instanceof L.GridLayer) {
    let extreme = name === 'bringToFront' ? -Infinity : Infinity;
    for (layer of Object.values(state.map._layers)) {
      if (layer === source || !(layer instanceof L.GridLayer) || layer.getPane() !== source.getPane()) continue;
      zIndex = layer.options.zIndex || 0;
      extreme = name === 'bringToFront' ? Math.max(extreme, zIndex) : Math.min(extreme, zIndex);
    }
    const edge = name === 'bringToFront' ? extreme + 1 : extreme - 1;
    if (Number.isFinite(edge)) source.setZIndex(edge);
  }
  if (name === 'bringToFront') state.order = mutateWeakMap(nativeGPUOrderByMap, state.map, "++", undefined, true);
  if (name === 'bringToBack') state.order = mutateWeakMap(nativeGPUBackByMap, state.map, "--", undefined, true);
  refreshNativeLayer(state);
  return result;
}
