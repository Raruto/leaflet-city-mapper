import { triangle } from './nativeTriangle.js';
import { line } from './line.js';
import { triangulate } from '../triangulation/triangulate.js';

export function polygon(context, rings, closed) {
  const { options, fill, point, map } = context, projected = [];
  for (const ring of rings) {
    const path = [];
    for (const latlng of ring) path.push(map.project(latlng));
    projected.push(path);
  }
  if (closed && options.fill && projected[0]?.length >= 3) {
    const valid = [];
    for (const ring of projected) if (ring.length >= 3) valid.push(ring);
    const vertices = valid.flat();
    for (const indices of triangulate(valid[0], valid.slice(1))) {
      triangle(point, fill, vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]);
    }
  }
  for (const ring of projected) line(context, ring, closed);
}
