import { cross } from './cross.js';
import { containsVertex } from './containsVertex.js';

export function clipEars(polygon) {
  const result = /* alloc */ [];
  let clipped, i, a, b, c, p;
  while (polygon.length > 3) {
    clipped = false;
    for (i = 0; i < polygon.length; i++) {
      a = polygon[(i + polygon.length - 1) % polygon.length], b = polygon[i], c = polygon[(i + 1) % polygon.length];
      if (cross(a, b, c) <= 1e-10) continue;
      if (containsVertex(polygon, a, b, c)) continue;
      result.push(/* alloc */ [a.index, b.index, c.index]); polygon.splice(i, 1); clipped = true; break;
    }
    if (!clipped) throw /* alloc */ new Error('Unable to triangulate polygon: invalid or self-intersecting rings');
  }
  if (cross(...polygon) > 1e-10) {
    const triangle = /* alloc */ [];
    for (p of polygon) triangle.push(p.index);
    result.push(triangle);
  }
  return result;
}
