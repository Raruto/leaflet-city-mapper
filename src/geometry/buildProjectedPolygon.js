import { triangulate } from '../triangulation/triangulate.js';
import { addTriangle } from './appendAreaTriangle.js';
import { isClockWise } from '../triangulation/isClockWise.js';

/**
 * Append roof, optional bottom and side triangles for a projected polygon.
 *
 * @param {Object} context Destination area geometry.
 * @param {Array<Array<Object>>} paths Projected outer ring and holes.
 * @param {number} top Extrusion top height.
 * @param {number} bottom Extrusion bottom height.
 * @param {Object} baseColor Parsed RGB color.
 */
export function buildProjectedPolygon(context, paths, top, bottom, baseColor) {
  const points = /* alloc */ [];
  let path, point, a, b, c, index, sign, i, length, nx, nz;
  for (path of paths) for (point of path) points.push(point);
  for ([a, b, c] of triangulate(paths[0], paths.slice(1))) {
    addTriangle(context, points[a], top, points[b], top, points[c], top, 0, 1, 0, baseColor);
    if (bottom > 0) addTriangle(context, points[a], bottom, points[b], bottom, points[c], bottom, 0, -1, 0, baseColor);
  }
  for (index = 0; index < paths.length; index++) {
    path = paths[index];
    sign = isClockWise(path) === (index === 0) ? -1 : 1;
    for (i = 0; i < path.length; i++) {
      a = path[i], b = path[(i + 1) % path.length];
      length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!length) continue;
      nx = sign * (b.y - a.y) / length, nz = sign * (b.x - a.x) / length;
      addTriangle(context, a, bottom, b, bottom, b, top, nx, 0, nz, baseColor);
      addTriangle(context, a, bottom, b, top, a, top, nx, 0, nz, baseColor);
    }
  }
}
