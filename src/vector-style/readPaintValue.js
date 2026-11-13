import { evaluateStyle } from './evaluateStyle.js';

/**
 * Evaluate a paint value or return its fallback when absent.
 *
 * @param {Object} paint Paint values.
 * @param {string} key Paint property name.
 * @param {*} fallback Default value.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 *
 * @returns {*} Evaluated paint value or fallback.
 */
export function readPaintValue(paint, key, fallback, properties, zoom) {
  if (paint[key] === undefined) return fallback;
  return evaluateStyle(paint[key], properties, zoom);
}
