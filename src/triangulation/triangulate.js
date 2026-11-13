import { geometryEmpty } from '../globals/geometryEmpty.js';
import { sortHoles } from './sortHoles.js';
import { polygonRings } from './polygonRings.js';
import { connectHole } from './connectHole.js';
import { clipEars } from './clipEars.js';
import { validateArea } from './validateArea.js';

/**
 * Triangulates a polygon given as `{x, y}` points.
 * Rings omit the repeated closing point; winding is normalized internally.
 * Vertex indices remain relative to the original inputs after duplicate/collinear
 * cleanup. Hole bridges duplicate endpoints, not source vertices.
 *
 * @param {Object[]} contour Outer boundary.
 * @param {Object[][]} [holes] Interior boundaries.
 *
 * @returns {number[][]} Triangles as indices in `[...contour, ...holes.flat()]`.
 *
 * @throws {Error} If a polygon coordinate is not finite.
 */
export function triangulate(contour, holes = geometryEmpty) {
  const paths = /* alloc */ [contour, ...holes];
  const points = paths.flat();
  let p, index, hole;
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
  const rings = polygonRings(paths, vertices);
  let polygon = rings[0].slice();
  // A bridge must stay inside the outer boundary, outside every hole, and cross no edge.
  // ponytail: quadratic ear clipping for building footprints; use spatial indexing for large rings.
  const holesToConnect = sortHoles(rings.slice(1));
  const mid = holesToConnect.length ? /* alloc */ { x: 0, y: 0 } : null;
  for (hole of holesToConnect) {
    polygon = connectHole(polygon, hole, rings, mid);
  }
  // Clip a convex corner only when no other vertex is inside/on its triangle.
  const result = clipEars(polygon);
  // Reject incomplete coverage instead of silently emitting a partial roof.
  validateArea(rings, vertices, result);
  return result;
}
