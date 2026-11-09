import { vectorTilePaint } from './vectorTilePaint.js';

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
