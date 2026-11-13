import { vectorPaint } from '../vector-style/vectorPaint.js';
import { visibleStyle } from '../vector-style/visibleStyle.js';

/**
 * Find usable fill or line paint for a compatible vector feature.
 *
 * @param {Object} entry Style layer entry.
 * @param {Object} feature Decoded feature.
 * @param {number} sampleZoom Initial style zoom.
 * @param {number} maxZoom Maximum zoom to search for visible line paint.
 *
 * @returns {Object|null} Paint, or null if no compatible visible paint exists.
 */
export function vectorFeaturePaint(entry, feature, sampleZoom, maxZoom) {
  if (entry.type === 'fill') return feature.type === 3 ? vectorPaint(entry, feature.properties, sampleZoom) : null;
  if (entry.type !== 'line' || feature.type !== 2) return null;
  let paint = vectorPaint(entry, feature.properties, sampleZoom), candidate;
  if (paint.weight > 0 && paint.opacity > 0) return paint;
  for (candidate = maxZoom; candidate >= 0; candidate--) {
    if (!visibleStyle(entry, feature.properties, candidate)) continue;
    paint = vectorPaint(entry, feature.properties, candidate);
    if (paint.weight > 0 && paint.opacity > 0) return paint;
  }
  return null;
}
