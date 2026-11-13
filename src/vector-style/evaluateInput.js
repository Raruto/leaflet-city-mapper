import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate an input or resolve a legacy string operand as a property name.
 *
 * @param {*} value Input value or expression.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 * @param {boolean} legacy Whether string values name properties.
 *
 * @returns {*} Evaluated input.
 */
export function evaluateInput(value, properties, zoom, legacy) {
  if (legacy && typeof value === 'string') return properties[value];
  return evaluateStyle(value, properties, zoom);
}
