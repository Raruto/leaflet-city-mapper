import { vectorTilePaint } from './vectorTilePaint.js';

/**
 * Update a rendered vector batch's paint at the given zoom.
 *
 * @param {Object} batch Rendered batch and its style entry.
 * @param {number} zoom Style zoom.
 */
export function paintVectorTileBatch(batch, zoom) {
  const paint = vectorTilePaint(batch, zoom), { layer } = batch;
  if (batch.kind === 'line') {
    if (paint.dashArray !== layer.options.dashArray) layer.setStyle(paint);
    else layer.setStyle(/* alloc */ { color: paint.color, opacity: paint.opacity, weight: paint.weight });
  } else if (JSON.stringify(paint.fillColor) !== JSON.stringify(layer.options.fillColor) ||
      paint.fillOpacity !== layer.options.fillOpacity) {
    layer.setStyle(/* alloc */ { fillColor: paint.fillColor, fillOpacity: paint.fillOpacity });
  }
}
