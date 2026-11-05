import { projectRing } from './projectRing.js';
import { triangulate } from '../triangulation/triangulate.js';
import { addTriangle } from './addTriangle.js';
import { isClockWise } from '../triangulation/isClockWise.js';

export function buildAreaPolygon(context, rings, top, bottom, baseColor) {
  if (!rings.length) throw new Error('Empty GeoJSON polygon');
  const paths = [];
  for (const ring of rings) paths.push(projectRing(context, ring));
  const points = [];
  for (const path of paths) for (const point of path) points.push(point);
  for (const [a, b, c] of triangulate(paths[0], paths.slice(1))) {
    addTriangle(context, points[a], top, points[b], top, points[c], top, 0, 1, 0, baseColor);
    if (bottom > 0) addTriangle(context, points[a], bottom, points[b], bottom, points[c], bottom, 0, -1, 0, baseColor);
  }
  for (let index = 0; index < paths.length; index++) {
    const path = paths[index];
    const sign = isClockWise(path) === (index === 0) ? -1 : 1;
    for (let i = 0; i < path.length; i++) {
      const a = path[i], b = path[(i + 1) % path.length];
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!length) continue;
      const nx = sign * (b.y - a.y) / length, nz = sign * (b.x - a.x) / length;
      addTriangle(context, a, bottom, b, bottom, b, top, nx, 0, nz, baseColor);
      addTriangle(context, a, bottom, b, top, a, top, nx, 0, nz, baseColor);
    }
  }
}
