import { CELL } from '../globals/CELL.js';
import { collider } from './collider.js';
import { computeBounds } from '../geometry/computeBounds.js';
import { collectIntersections } from './collectIntersections.js';
import { countCrossings } from './countCrossings.js';

/**
 * Test a world-space point against visible mesh features, reusing the supplied intersection scratch buffers.
 *
 * @param {Object} mesh Mesh to test.
 * @param {number} x World-space x coordinate.
 * @param {number} y World-space y coordinate.
 * @param {number} z World-space z coordinate.
 * @param {Set<number>} seen Reusable set of visited triangle indices.
 * @param {number[]} intersections Reusable array of crossing data.
 *
 * @returns {boolean} Whether a feature encloses the point.
 */
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
  x += shape.origin[0] - world[12];
  y += shape.origin[1] - world[13];
  z += shape.origin[2] - world[14];
  const end = Math.floor(shape.maxX / CELL);
  if (x >= shape.maxX) return false;
  const iz = Math.floor(z / CELL);
  const hits = intersections;
  hits.length = 0;
  seen.clear();
  collectIntersections(shape, x, y, z, seen, hits, end, iz);
  return countCrossings(hits, shape.ranges) > 0;
}
