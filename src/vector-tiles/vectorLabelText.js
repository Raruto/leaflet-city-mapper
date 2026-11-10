import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { vectorLabelProperty } from './vectorLabelProperty.js';

export function vectorLabelText(entry, properties, zoom) {
  let text = entry.layout?.['text-field'];
  if (Array.isArray(text)) text = evaluateStyle(text, properties, zoom);
  if (typeof text !== 'string') text = '';
  text = text.replace(/\{([^}]+)\}/g, vectorLabelProperty.bind(null, properties));
  return entry.layout?.['text-transform'] === 'uppercase' ? text.toUpperCase() : text;
}
