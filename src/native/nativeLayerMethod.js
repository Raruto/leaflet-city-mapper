import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { nativeGPUBackByMap } from '../weakmaps/nativeGPUBackByMap.js';
import { nativeGPUOrderByMap } from '../weakmaps/nativeGPUOrderByMap.js';


import { refreshNativeLayer } from './refreshNativeLayer.js';
import { canScaleNativeStyle } from './canScaleNativeStyle.js';
import { orderNativeGridLayer } from './orderNativeGridLayer.js';

export function nativeLayerMethod(name, source, args) {
  const state = nativeGPUByLayer.get(source), original = state.methods.get(name).original;
  const scalable = canScaleNativeStyle(name, state, args);
  const result = original.apply(source, args);
  orderNativeGridLayer(state, name);
  if (name === 'bringToFront') {
    state.order = nativeGPUOrderByMap.get(state.map) + 1;
    nativeGPUOrderByMap.set(state.map, state.order);
  }
  if (name === 'bringToBack') {
    state.order = nativeGPUBackByMap.get(state.map) - 1;
    nativeGPUBackByMap.set(state.map, state.order);
  }
  refreshNativeLayer(state);
  if (scalable && (!source.options.stroke || Number(source.options.weight) > 0)) state.zoomOnly = true;
  return result;
}
