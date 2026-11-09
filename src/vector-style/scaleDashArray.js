import { evaluateStyle } from './evaluateStyle.js';

export function scaleDashArray(dash, weight, properties, zoom) {
  if (!dash) return undefined;
  let values = dash, i = 0, result = '';
  if (typeof dash[0] !== 'number') values = evaluateStyle(dash, properties, zoom);
  if (!Array.isArray(values)) throw /* alloc */ new TypeError('Style dash array must be an array');
  for (i = 0; i < values.length; i++) {
    if (i) result += ' ';
    result += values[i] * weight;
  }
  return result;
}
