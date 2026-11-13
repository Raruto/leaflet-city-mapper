import { CELL } from '../globals/CELL.js';
import { horizontalRay } from './horizontalRay.js';

/**
 * Collect positive X-ray hits and polygon footprint crossings, grouped by feature in the shared hits array.
 *
 * @param {Object} shape Cached collider and its spatial grid.
 * @param {number} x Ray origin x coordinate.
 * @param {number} y Ray origin y coordinate.
 * @param {number} z Ray origin z coordinate.
 * @param {Set<number>} seen Reusable set of visited triangle indices.
 * @param {number[]} hits Output array of feature keys and distances.
 * @param {number} end Last x cell to inspect.
 * @param {number} iz Z cell containing the ray.
 */
export function collectIntersections(shape, x, y, z, seen, hits, end, iz) {
  const { tri, features, ranges } = shape;
  let ix, cell, triangle, distance, feature, i, ax, az, bx, bz, cx, cz, ab, ac, bc;
  for (ix = Math.floor(x / CELL); ix <= end; ix++) {
    cell = shape.cells.get(`${ix},${iz}`);
    if (!cell) continue;
    for (triangle of cell) {
      if (seen.has(triangle)) continue;
      seen.add(triangle);
      feature = features[triangle];
      distance = horizontalRay(tri, triangle, x, y, z, 1, 0);
      if (distance > 1e-4) hits.push(feature * 2, distance);
      if (!ranges?.[feature]?.polygon) continue;
      i = triangle * 9;
      ax = tri[i], az = tri[i + 2], bx = tri[i + 3], bz = tri[i + 5], cx = tri[i + 6], cz = tri[i + 8];
      ab = (ax - bx) ** 2 + (az - bz) ** 2;
      ac = (ax - cx) ** 2 + (az - cz) ** 2;
      bc = (bx - cx) ** 2 + (bz - cz) ** 2;
      if (ac > ab && ac >= bc) bx = cx, bz = cz;
      else if (bc > ab && bc > ac) ax = bx, az = bz, bx = cx, bz = cz;
      if ((az > z) === (bz > z)) continue;
      distance = ax + (z - az) * (bx - ax) / (bz - az) - x;
      if (distance > 1e-4) hits.push(feature * 2 + 1, distance);
    }
  }
}
