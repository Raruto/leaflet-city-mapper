import { evaluateStyle } from './evaluateStyle.js';

/**
 * Check a style layer's zoom range, visibility and feature filter.
 *
 * @param {Object} layer Vector style layer.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 *
 * @returns {boolean} Whether the layer is visible for the feature.
 */
export function visibleStyle(layer, properties, zoom) {
  return zoom >= (layer.minzoom ?? 0) && zoom < (layer.maxzoom ?? Infinity) &&
    layer.layout?.visibility !== 'none' &&
    (!layer.filter || evaluateStyle(layer.filter, properties, zoom, true));
}
