import { projectRing } from './projectRing.js';
import { triangulate } from '../triangulation/triangulate.js';
import { addTriangle } from './addTriangle.js';
import { isClockWise } from '../triangulation/isClockWise.js';

export function buildAreaPolygon(context, rings, top, bottom, baseColor) {
  if (!rings.length) throw new Error('Empty GeoJSON polygon');
  const paths = [];
  let ring, path, point, a, b, c, index, sign, i, length, nx, nz;
  for (ring of rings) paths.push(projectRing(context, ring));
  const points = [];
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
