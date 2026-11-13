import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { vectorLabelProperty } from './vectorLabelProperty.js';

/**
 * Evaluate a label's text, expand property placeholders and apply uppercase transformation.
 *
 * @param {Object} entry Style layer entry.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Style zoom.
 *
 * @returns {string} Label text.
 */
export function vectorLabelText(entry, properties, zoom) {
  let text = entry.layout?.['text-field'];
  if (Array.isArray(text)) text = evaluateStyle(text, properties, zoom);
  if (typeof text !== 'string') text = '';
  text = text.replace(/\{([^}]+)\}/g, vectorLabelProperty.bind(null, properties));
  return entry.layout?.['text-transform'] === 'uppercase' ? text.toUpperCase() : text;
}
