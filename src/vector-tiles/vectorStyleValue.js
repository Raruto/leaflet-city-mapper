import { evaluateStyle } from '../vector-style/evaluateStyle.js';

/**
 * Evaluate a style property or return its fallback when absent.
 *
 * @param {Object} object Style properties.
 * @param {string} key Property name.
 * @param {*} fallback Default value.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Style zoom.
 *
 * @returns {*} Evaluated or fallback value.
 */
export function vectorStyleValue(object, key, fallback, properties, zoom) {
  return object?.[key] === undefined ? fallback : evaluateStyle(object[key], properties, zoom);
}
