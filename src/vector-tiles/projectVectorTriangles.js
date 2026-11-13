import { triangulateVectorRings } from '../mvt/triangulateVectorRings.js';
import { projectVectorPoint } from './projectVectorPoint.js';
import { simplifyVectorPath } from './simplifyVectorPath.js';

/**
 * Simplify polygon rings, triangulate them and project their vertices.
 *
 * @param {Array} geometry Tile coordinate rings.
 * @param {Object} coords Tile coordinates.
 * @param {number} extent Tile coordinate extent.
 * @param {number} tolerance Simplification tolerance.
 *
 * @returns {Array} Projected triangle paths.
 */
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
