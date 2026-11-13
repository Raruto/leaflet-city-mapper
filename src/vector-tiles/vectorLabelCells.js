import { vectorStyleZoom } from './vectorStyleZoom.js';
import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { visibleStyle } from '../vector-style/visibleStyle.js';
import { updateVectorLabelStyle } from './updateVectorLabelStyle.js';

/**
 * Compute screen cells occupied by a visible, placeable vector label.
 *
 * @param {Object} layer Vector tile layer.
 * @param {Object} label Label candidate.
 * @param {Object} size Map viewport size.
 *
 * @returns {Array<string>|null} Occupied cell keys, or null if the label cannot be placed.
 */
export function vectorLabelCells(layer, label, size) {
  const map = layer._map, zoom = vectorStyleZoom(layer);
  if (!visibleStyle(label.entry, label.properties, zoom)) return null;
  updateVectorLabelStyle(label, zoom);
  if (!(label.size > 0)) return null;
  if (label.icon && !vectorTileOptionsByLayer.get(layer).spriteSheet?.index[label.icon]) return null;
  if (label.along && label.pixelBase * 2 ** map.getZoom() < label.text.length * label.size * 0.6) return null;
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
