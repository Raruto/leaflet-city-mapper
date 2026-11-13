import { L } from '../globals/L.js';

/**
 * Copy an array or point-like object into a Leaflet point.
 *
 * @param {number[]|Object} point Array or object with x and y coordinates.
 *
 * @returns {L.Point} New point.
 */
export function pointOf(point) {
  return /* alloc */ new L.Point(
    Array.isArray(point) ? point[0] : point.x, Array.isArray(point) ? point[1] : point.y);
}
