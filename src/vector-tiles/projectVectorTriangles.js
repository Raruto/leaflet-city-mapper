import { triangulateVectorRings } from '../mvt/triangulateVectorRings.js';
import { projectVectorPoint } from './projectVectorPoint.js';

export function projectVectorTriangles(geometry, coords, extent) {
  const paths = /* alloc */ [];
  let triangle, projected, point;
  for (triangle of triangulateVectorRings(geometry)) {
    projected = /* alloc */ [];
    for (point of triangle) projected.push(projectVectorPoint(point, coords, extent));
    paths.push(/* alloc */ [projected]);
  }
  return paths;
}
