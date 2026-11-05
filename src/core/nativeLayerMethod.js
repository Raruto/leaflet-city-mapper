import { refreshNativeLayer } from './refreshNativeLayer.js';

export function nativeLayerMethod(name, source, args) {
  const state = source._nativeGPU, original = state.originalMethods.get(name);
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
  if (name === 'bringToFront') state.order = ++state.map._nativeGPUOrder;
  if (name === 'bringToBack') state.order = --state.map._nativeGPUBack;
  refreshNativeLayer(state);
  return result;
}
