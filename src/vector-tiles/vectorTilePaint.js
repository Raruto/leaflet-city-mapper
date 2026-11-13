import { vectorPaint } from '../vector-style/vectorPaint.js';
import { visibleStyle } from '../vector-style/visibleStyle.js';

/**
 * Evaluate batch paint and make it transparent when its style is not visible.
 *
 * @param {Object} batch Vector batch and style properties.
 * @param {number} zoom Style zoom.
 *
 * @returns {Object} Evaluated paint.
 */
export function vectorTilePaint(batch, zoom) {
  const paint = vectorPaint(batch.entry, batch.properties, zoom);
  if (!visibleStyle(batch.entry, batch.properties, zoom)) {
    paint.opacity = 0; paint.fillOpacity = 0;
  }
  return paint;
}
