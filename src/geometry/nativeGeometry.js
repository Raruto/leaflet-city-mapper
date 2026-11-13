import { L } from '../globals/L.js';
import { visit } from './visitNativeCoordinates.js';
import { dashValues } from './dashValues.js';
import { circleGeometry } from './circleGeometry.js';

/**
 * Convert a Leaflet path into flat fill and stroke triangles.
 *
 * @param {L.Path} source Native path.
 * @param {L.Map} map Map used to project coordinates.
 * @param {Function} point Vertex projection function.
 *
 * @returns {Object} Fill and stroke vertex arrays.
 */
export function nativeGeometry(source, map, point) {
  const fill = /* alloc */ [];
  const stroke = /* alloc */ [];
  const options = source.options;
  const width = Number(options.weight) || 0;
  const dash = dashValues(options);
  const context = /* alloc */ { fill, stroke, options, width, dash, point, map };
  if (source instanceof L.CircleMarker) {
    circleGeometry(source, context);
  } else {
    const closed = source instanceof L.Polygon;
    visit(context, source.getLatLngs(), closed);
  }
  return /* alloc */ { fill, stroke };
}
