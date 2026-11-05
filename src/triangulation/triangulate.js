import { geometryEmpty } from '../globals/geometryEmpty.js';
import { isClockWise } from "./isClockWise.js";
import { cross } from './cross.js';
import { clean } from './clean.js';
import { inside } from './inside.js';
import { insideHole } from './insideHole.js';
import { crossesBoundary } from './crossesBoundary.js';
import { containsVertex } from './containsVertex.js';
import { area } from './area.js';
import { sortHoles } from './sortHoles.js';


/**
 * Triangulates a polygon given as `{x, y}` points.
 * Rings omit the repeated closing point; winding is normalized internally.
 * Vertex indices remain relative to the original inputs after duplicate/collinear
 * cleanup. Hole bridges duplicate endpoints, not source vertices.
 * @param {Object[]} contour Outer boundary.
 * @param {Object[][]} [holes] Interior boundaries.
 *
 * @returns {number[][]} Triangles as indices in `[...contour, ...holes.flat()]`.
 */

export function triangulate(contour, holes = geometryEmpty) {
  const paths = /* alloc */ [contour, ...holes];
  const points = paths.flat();
  let p, index, path, ring, hole, distance, h, a, b, d, h2, p2, clipped, i, c, triangle2;
  for (p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw /* alloc */ new Error('Invalid polygon coordinates');
  }
  // Translate near the origin to avoid cancellation with geographic coordinates.
  const vertices = /* alloc */ [];
  for (index = 0; index < points.length; index++) {
    p = points[index];
    vertices.push(/* alloc */ { x: p.x - contour[0].x, y: p.y - contour[0].y, index });
  }
  // Remove zero-area corners before connecting holes; keep original vertex indices.
  let offset = 0;
  const rings = /* alloc */ [];
  for (index = 0; index < paths.length; index++) {
    path = paths[index];
    ring = clean(vertices.slice(offset, offset += path.length));
    if (isClockWise(ring) !== Boolean(index)) ring.reverse();
    rings.push(ring);
  }
  let polygon = rings[0].slice();
  // A bridge must stay inside the outer boundary, outside every hole, and cross no edge.
  // ponytail: quadratic ear clipping for building footprints; use spatial indexing for large rings.
  const holesToConnect = sortHoles(rings.slice(1));
  const mid = holesToConnect.length ? /* alloc */ { x: 0, y: 0 } : null;
  for (hole of holesToConnect) {
    h2 = -1, p2 = -1, distance = Infinity;
    for (h = 0; h < hole.length; h++) for (p = 0; p < polygon.length; p++) {
      a = hole[h], b = polygon[p], d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (d >= distance) continue;
      mid.x = (a.x + b.x) / 2; mid.y = (a.y + b.y) / 2;
      if (!inside(mid, rings[0]) || insideHole(mid, rings)) continue;
      if (crossesBoundary(a, b, polygon, rings)) continue;
      h2 = h; p2 = p; distance = d;
    }
    if (h2 < 0) throw /* alloc */ new Error('Unable to connect polygon hole');
    polygon = /* alloc */ [...polygon.slice(0, p2 + 1), ...hole.slice(h2), ...hole.slice(0, h2 + 1),
    polygon[p2], ...polygon.slice(p2 + 1)];
  }
  // Clip a convex corner only when no other vertex is inside/on its triangle.
  const result = /* alloc */ [];
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
  // Reject incomplete coverage instead of silently emitting a partial roof.
  let holeArea = 0, actual = 0;
  for (i = 1; i < rings.length; i++) holeArea += area(rings[i]);
  const expected = area(rings[0]) - holeArea;
  for (triangle2 of result) actual += cross(vertices[triangle2[0]], vertices[triangle2[1]], vertices[triangle2[2]]) / 2;
  if (expected <= 0 || Math.abs(actual - expected) > Math.max(1e-7, expected * 1e-8)) throw /* alloc */ new Error('Polygon triangulation area mismatch');
  return result;
}
