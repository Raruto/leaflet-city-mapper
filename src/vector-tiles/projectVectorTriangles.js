import { triangulateVectorRings } from '../mvt/triangulateVectorRings.js';
import { projectVectorPoint } from './projectVectorPoint.js';
import { simplifyVectorPath } from './simplifyVectorPath.js';

export function projectVectorTriangles(geometry, coords, extent, tolerance) {
  const paths = /* alloc */ [], rings = /* alloc */ [];
  let triangle, projected, point, ring;
  for (ring of geometry) {
    ring = simplifyVectorPath(ring, tolerance);
    if (ring.length >= 4) rings.push(ring);
  }
  for (triangle of triangulateVectorRings(rings)) {
    projected = /* alloc */ [];
    for (point of triangle) projected.push(projectVectorPoint(point, coords, extent));
    paths.push(/* alloc */ [projected]);
  }
  return paths;
}
