import { vectorPaint } from '../vector-style/vectorPaint.js';
import { visibleStyle } from '../vector-style/visibleStyle.js';

export function vectorTilePaint(batch, zoom) {
  const paint = vectorPaint(batch.entry, batch.properties, zoom);
  if (!visibleStyle(batch.entry, batch.properties, zoom)) {
    paint.opacity = 0; paint.fillOpacity = 0;
  }
  return paint;
}
