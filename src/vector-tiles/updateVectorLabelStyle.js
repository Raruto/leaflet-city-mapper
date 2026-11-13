import { evaluateStyle } from '../vector-style/evaluateStyle.js';

/**
 * Evaluate the text appearance of a label at the given zoom.
 *
 * @param {Object} label Label candidate.
 * @param {number} zoom Style zoom.
 */
export function updateVectorLabelStyle(label, zoom) {
  label.size = evaluateStyle(label.entry.layout?.['text-size'] ?? 12, label.properties, zoom);
  label.color = evaluateStyle(label.entry.paint?.['text-color'] ?? '#000', label.properties, zoom);
  label.halo = evaluateStyle(label.entry.paint?.['text-halo-color'] ?? '#fff', label.properties, zoom);
  label.haloWidth = evaluateStyle(label.entry.paint?.['text-halo-width'] ?? 0, label.properties, zoom);
}
