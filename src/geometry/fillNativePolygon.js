import { triangle } from './appendNativeTriangle.js';
import { triangulate } from '../triangulation/triangulate.js';

export function fillNativePolygon(context, projected) {
  const { options, fill, point } = context;
  if (options.triangulated) {
    if (projected.length !== 1 || projected[0].length !== 3) {
      throw /* alloc */ new Error('triangulated polygons require three vertices per polygon and no holes');
    }
    triangle(point, fill, projected[0][0], projected[0][1], projected[0][2]);
    return;
  }
  const valid = /* alloc */ [];
  let ring, indices;
  for (ring of projected) if (ring.length >= 3) valid.push(ring);
  const vertices = valid.flat();
  for (indices of triangulate(valid[0], valid.slice(1))) {
    triangle(point, fill, vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]);
  }
}
