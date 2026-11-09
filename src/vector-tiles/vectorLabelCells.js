import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { visibleStyle } from '../vector-style/visibleStyle.js';

export function vectorLabelCells(map, label, size) {
  const zoom = map.getZoom();
  if (!visibleStyle(label.entry, label.properties, zoom)) return null;
  label.size = evaluateStyle(label.entry.layout?.['text-size'] ?? 12, label.properties, zoom);
  if (!(label.size > 0)) return null;
  label.color = evaluateStyle(label.entry.paint?.['text-color'] ?? '#000', label.properties, zoom);
  label.halo = evaluateStyle(label.entry.paint?.['text-halo-color'] ?? '#fff', label.properties, zoom);
  label.haloWidth = evaluateStyle(label.entry.paint?.['text-halo-width'] ?? 0, label.properties, zoom);
  const point = map.latLngToContainerPoint(label.latlng);
  if (point.x < 0 || point.y < 0 || point.x > size.x || point.y > size.y) return null;
  const width = label.text.length * label.size * 0.65 + 16, cells = /* alloc */ [];
  let x, y;
  for (x = Math.floor((point.x - width / 2) / 32); x <= Math.floor((point.x + width / 2) / 32); x++) {
    for (y = Math.floor((point.y - label.size) / 24); y <= Math.floor((point.y + label.size) / 24); y++) {
      cells.push(`${x}:${y}`);
    }
  }
  return cells;
}
