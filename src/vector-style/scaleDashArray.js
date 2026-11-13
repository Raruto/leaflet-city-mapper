import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate and scale a style dash array by the line width.
 *
 * @param {Array} dash Dash pattern or expression, if present.
 * @param {number} weight Line width.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 *
 * @returns {string|undefined} Space-separated scaled dashes, or undefined.
 *
 * @throws {TypeError} If the evaluated dash pattern is not an array.
 */
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
