import { CELL } from '../globals/CELL.js';
import { horizontalRay } from './horizontalRay.js';

export function collectIntersections(shape, x, y, z, seen, hits, end, iz) {
  let ix, cell, triangle, distance;
  for (ix = Math.floor(x / CELL); ix <= end; ix++) {
    cell = shape.cells.get(`${ix},${iz}`);
    if (!cell) continue;
    for (triangle of cell) {
      if (seen.has(triangle)) continue;
      seen.add(triangle);
      distance = horizontalRay(shape.tri, triangle, x, y, z, 1, 0);
      if (distance > 1e-4) hits.push(distance);
    }
  }
}
