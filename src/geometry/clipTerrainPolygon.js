import { L } from '../globals/L.js';

/**
 * Clip a convex pixel polygon against an axis or terrain-cell diagonal.
 *
 * @param {Array<L.Point>} polygon Convex polygon.
 * @param {number} axis Zero for x, one for y, two for x plus y.
 * @param {number} boundary Clip coordinate.
 * @param {boolean} greater Whether to retain coordinates above the boundary.
 *
 * @returns {Array<L.Point>} Clipped polygon.
 */
export function clipTerrainPolygon(polygon, axis, boundary, greater) {
  const result = /* alloc */ [];
  let previous = polygon.at(-1), current, a, b, t;
  for (current of polygon) {
    a = (axis === 0 ? previous.x : axis === 1 ? previous.y : previous.x + previous.y) - boundary;
    b = (axis === 0 ? current.x : axis === 1 ? current.y : current.x + current.y) - boundary;
    if ((greater ? a >= 0 : a <= 0) !== (greater ? b >= 0 : b <= 0)) {
      t = a / (a - b);
      result.push(/* alloc */ new L.Point(previous.x + (current.x - previous.x) * t,
        previous.y + (current.y - previous.y) * t));
    }
    if (greater ? b >= 0 : b <= 0) result.push(current);
    previous = current;
  }
  return result;
}
