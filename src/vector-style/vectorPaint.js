import { fillVectorPaint } from './fillVectorPaint.js';
import { lineVectorPaint } from './lineVectorPaint.js';

export function vectorPaint(layer, properties, zoom) {
  const paint = layer.paint || /* alloc */ {};
  if (layer.type === 'fill') return fillVectorPaint(paint, properties, zoom);
  return lineVectorPaint(layer, paint, properties, zoom);
}
