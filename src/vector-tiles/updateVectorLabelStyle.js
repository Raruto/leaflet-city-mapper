import { evaluateStyle } from '../vector-style/evaluateStyle.js';

export function updateVectorLabelStyle(label, zoom) {
  label.size = evaluateStyle(label.entry.layout?.['text-size'] ?? 12, label.properties, zoom);
  label.color = evaluateStyle(label.entry.paint?.['text-color'] ?? '#000', label.properties, zoom);
  label.halo = evaluateStyle(label.entry.paint?.['text-halo-color'] ?? '#fff', label.properties, zoom);
  label.haloWidth = evaluateStyle(label.entry.paint?.['text-halo-width'] ?? 0, label.properties, zoom);
}
