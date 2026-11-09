import { evaluateStyle } from '../vector-style/evaluateStyle.js';

export function vectorStyleValue(object, key, fallback, properties, zoom) {
  return object?.[key] === undefined ? fallback : evaluateStyle(object[key], properties, zoom);
}
