import { L } from '../globals/L.js';

export function orderNativeGridLayer(state, name) {
  const { source } = state;
  if (!(source instanceof L.GridLayer) || name !== 'bringToFront' && name !== 'bringToBack') return;
  let extreme = name === 'bringToFront' ? -Infinity : Infinity, layer, zIndex;
  for (layer of Object.values(state.map._layers)) {
    if (layer === source || !(layer instanceof L.GridLayer) || layer.getPane() !== source.getPane()) continue;
    zIndex = layer.options.zIndex || 0;
    extreme = name === 'bringToFront' ? Math.max(extreme, zIndex) : Math.min(extreme, zIndex);
  }
  const edge = name === 'bringToFront' ? extreme + 1 : extreme - 1;
  if (Number.isFinite(edge)) source.setZIndex(edge);
}
