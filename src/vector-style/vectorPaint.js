import { fillVectorPaint } from './fillVectorPaint.js';
import { lineVectorPaint } from './lineVectorPaint.js';

/**
 * Resolve a vector style layer's fill or line paint for a feature.
 *
 * @param {Object} layer Vector style layer.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 *
 * @returns {Object} Resolved rendering options.
 */
export function vectorPaint(layer, properties, zoom) {
  const paint = layer.paint || /* alloc */ {};
  if (layer.type === 'fill') return fillVectorPaint(paint, properties, zoom);
  return lineVectorPaint(layer, paint, properties, zoom);
}
