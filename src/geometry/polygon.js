import { triangle } from './nativeTriangle.js';
import { line } from './line.js';
import { triangulate } from '../triangulation/triangulate.js';

export function polygon(context, rings, closed) {
  const { options, fill, point, map } = context;
  const projected = /* allocation: required -- Polygon paths stay private across reentrant map projection callbacks. */ [];
  let ring, path, latlng, indices;
  for (ring of rings) {
    path = /* allocation: required -- Each projected polygon ring retains independently ordered vertices. */ [];
    for (latlng of ring) path.push(map.project(latlng));
    projected.push(path);
  }
  if (closed && options.fill && projected[0]?.length >= 3) {
    const valid = /* allocation: required -- Filtered rings belong to this polygon triangulation and cannot share recursive traversal state. */ [];
    for (ring of projected) if (ring.length >= 3) valid.push(ring);
    const vertices = valid.flat();
    for (indices of triangulate(valid[0], valid.slice(1))) {
      triangle(point, fill, vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]);
    }
  }
  for (ring of projected) line(context, ring, closed);
}
