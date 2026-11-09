import { readPaintValue } from './readPaintValue.js';
import { scaleDashArray } from './scaleDashArray.js';
import { styleColor } from './styleColor.js';

export function lineVectorPaint(layer, paint, properties, zoom) {
  const weight = readPaintValue(paint, 'line-width', 1, properties, zoom);
  const rgb = styleColor(readPaintValue(paint, 'line-color', '#000', properties, zoom));
  const opacity = readPaintValue(paint, 'line-opacity', 1, properties, zoom) * rgb[3];
  const dashArray = scaleDashArray(paint['line-dasharray'], weight, properties, zoom);
  const lineCap = layer.layout?.['line-cap'] || 'butt';
  const lineJoin = layer.layout?.['line-join'] || 'miter';
  const color = /* alloc */ { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 };
  return /* alloc */ {
    color,
    opacity,
    weight,
    dashArray,
    lineCap,
    lineJoin
  };
}
