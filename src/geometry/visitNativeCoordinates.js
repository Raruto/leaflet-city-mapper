import { L } from '../globals/L.js';
import { polygon } from './polygon.js';

/**
 * Visit nested native coordinates and generate polygon or line geometry.
 *
 * @param {Object} context Projection, style and geometry buffers.
 * @param {Array} coordinates Nested Leaflet coordinates.
 * @param {boolean} closed Whether the geometry is closed.
 */
export function visit(context, coordinates, closed) {
  if (!coordinates.length) return;
  let child;
  if (coordinates[0] instanceof L.LatLng) polygon(context, /* alloc */ [coordinates], closed);
  else if (closed && coordinates[0][0] instanceof L.LatLng) polygon(context, coordinates, closed);
  else for (child of coordinates) visit(context, child, closed);
}
