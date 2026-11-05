import { triangle } from './nativeTriangle.js';
import { line } from './line.js';
import { triangulate } from '../triangulation/triangulate.js';

export function polygon(context, rings, closed) {
  const { options, fill, point, map } = context, projected = [];
  let ring, path, latlng, indices;
  for (ring of rings) {
    path = [];
    for (latlng of ring) path.push(map.project(latlng));
    projected.push(path);
  }
  if (closed && options.fill && projected[0]?.length >= 3) {
    const valid = [];
    for (ring of projected) if (ring.length >= 3) valid.push(ring);
    const vertices = valid.flat();
    for (indices of triangulate(valid[0], valid.slice(1))) {
      triangle(point, fill, vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]);
    }
  }
  for (ring of projected) line(context, ring, closed);
}
