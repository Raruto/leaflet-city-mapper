import { vectorPaint } from '../vector-style/vectorPaint.js';
import { visibleStyle } from '../vector-style/visibleStyle.js';

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
