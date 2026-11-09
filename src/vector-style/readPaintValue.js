import { evaluateStyle } from './evaluateStyle.js';

export function readPaintValue(paint, key, fallback, properties, zoom) {
  if (paint[key] === undefined) return fallback;
  return evaluateStyle(paint[key], properties, zoom);
}
