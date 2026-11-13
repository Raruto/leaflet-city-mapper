import { readPaintValue } from './readPaintValue.js';
import { styleColor } from './styleColor.js';

/**
 * Resolve fill paint expressions to normalized colors and opacity.
 *
 * @param {Object} paint Vector style paint values.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current zoom.
 *
 * @returns {Object} Fill and outline rendering options.
 */
export function fillVectorPaint(paint, properties, zoom) {
  const fill = styleColor(readPaintValue(paint, 'fill-color', '#000', properties, zoom));
  const outline = readPaintValue(paint, 'fill-outline-color', null, properties, zoom);
  const rgb = outline === null ? null : styleColor(outline);
  const fillOpacity = readPaintValue(paint, 'fill-opacity', 1, properties, zoom) * fill[3];
  const fillColor = /* alloc */ { r: fill[0] / 255, g: fill[1] / 255, b: fill[2] / 255 };
  const color = rgb ? /* alloc */ { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 } : null;
  return /* alloc */ {
    fillColor,
    fillOpacity,
    color,
    weight: 0.5
  };
}
