import { evaluateStyle } from './evaluateStyle.js';

export function visibleStyle(layer, properties, zoom) {
  return zoom >= (layer.minzoom ?? 0) && zoom < (layer.maxzoom ?? Infinity) &&
    layer.layout?.visibility !== 'none' &&
    (!layer.filter || evaluateStyle(layer.filter, properties, zoom, true));
}
