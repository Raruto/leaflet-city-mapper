import { L } from '../globals/L.js';

/**
 * Create a Leaflet icon displaying a sprite sheet region with the label offset.
 *
 * @param {Object} label Label candidate with sprite name and offset.
 * @param {Object} sheet Sprite URL and index.
 *
 * @returns {Object} Leaflet div icon.
 */
export function vectorSpriteIcon(label, sheet) {
  const { x, y, width, height } = sheet.index[label.icon], [dx, dy] = label.iconOffset;
  return /* alloc */ new L.DivIcon(/* alloc */ {
    className: '',
    html: `<div style="width:${width}px;height:${height}px;background:url(${sheet.url}) -${x}px -${y}px"></div>`,
    iconSize: /* alloc */ [width, height],
    iconAnchor: /* alloc */ [width / 2 - dx, height / 2 - dy],
  });
}
