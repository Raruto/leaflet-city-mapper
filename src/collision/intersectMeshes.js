import { sortHits } from './sortHits.js';
import { localRay } from './localRay.js';
import { rayBounds } from './rayBounds.js';
import { readTriangle } from './readTriangle.js';
import { triangleDistance } from './triangleDistance.js';
import { worldHit } from './worldHit.js';

/** Nearest triangle hit per mesh, sorted by world-space distance. */
export function intersectMeshes(ray, meshes, night = 0) {
  const hits = /* alloc */ [];
  const a = /* alloc */ [0, 0, 0], b = /* alloc */ [0, 0, 0], c = /* alloc */ [0, 0, 0];
  const origin = /* alloc */ [0, 0, 0], direction = /* alloc */ [0, 0, 0];
  let mesh, position, index, instanceOffset, vertices, closest, faceIndex, i, distance;
  for (mesh of meshes) {
    // Test locally, then compare distances in shared world space.
    localRay(ray, mesh, origin, direction);
    if (!rayBounds(mesh, origin, direction)) continue;
    ({ position, index, instanceOffset } = mesh.geometry.attributes);
    vertices = index?.count || position.count;
    closest = Infinity, faceIndex = void 0;
    for (i = 0; i < vertices * (instanceOffset?.count ?? 1); i += 3) {
      readTriangle(mesh, i, a, b, c);
      distance = triangleDistance(mesh, i, a, b, c, origin, direction, night);
      if (distance > 0 && distance < closest) {
        closest = distance; faceIndex = i / 3;
      }
    }
    if (faceIndex === undefined) continue;
    hits.push(worldHit(ray, mesh, origin, direction, closest, faceIndex));
  }
  return sortHits(hits);
}
