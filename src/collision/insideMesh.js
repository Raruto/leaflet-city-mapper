import { CELL } from '../globals/CELL.js';

import { collider } from './collider.js';
import { horizontalRay } from './horizontalRay.js';
import { computeBounds } from '../geometry/computeBounds.js';

export function insideMesh(mesh, x, y, z, seen, intersections) {
  const geometry = mesh.geometry;
  if (!mesh.visible || !geometry?.attributes?.position?.data || mesh.program?.depthTest === false) return false;
  if (!geometry.bounds) computeBounds(geometry);
  const bounds = geometry.bounds;
  const world = mesh.worldMatrix;
  const center = bounds.center;
  const cx = world[0] * center[0] + world[4] * center[1] + world[8] * center[2] + world[12];
  const cy = world[1] * center[0] + world[5] * center[1] + world[9] * center[2] + world[13];
  const cz = world[2] * center[0] + world[6] * center[1] + world[10] * center[2] + world[14];
  const radius = bounds.radius * Math.max(
    Math.hypot(world[0], world[1], world[2]),
    Math.hypot(world[4], world[5], world[6]),
    Math.hypot(world[8], world[9], world[10])
  );
  if (Math.hypot(cx - x, cy - y, cz - z) > radius) return false;
  const shape = collider(mesh);
  const end = Math.floor(shape.maxX / CELL);
  if (x >= shape.maxX) return false;
  const iz = Math.floor(z / CELL);
  const hits = intersections;
  hits.length = 0;
  seen.clear();
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
  for (ix = 1; ix < hits.length; ix++) {
    distance = hits[ix];
    let j = ix - 1;
    while (j >= 0 && hits[j] > distance) hits[j + 1] = hits[j--];
    hits[j + 1] = distance;
  }
  let crossings = 0, previous = -Infinity;
  for (distance of hits) {
    if (distance - previous > 1e-4) crossings++;
    previous = distance;
  }
  return crossings % 2 === 1;
}
