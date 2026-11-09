import { evaluateStyle } from './evaluateStyle.js';

export function evaluateInput(value, properties, zoom, legacy) {
  if (legacy && typeof value === 'string') return properties[value];
  return evaluateStyle(value, properties, zoom);
}
