import { projectVectorPoint } from './projectVectorPoint.js';
import { simplifyVectorPath } from './simplifyVectorPath.js';

export function projectVectorPaths(geometry, coords, extent, tolerance) {
  const paths = /* alloc */ [];
  let path, projected, point;
  for (path of geometry) {
    projected = /* alloc */ [];
    for (point of simplifyVectorPath(path, tolerance)) projected.push(projectVectorPoint(point, coords, extent));
    paths.push(projected);
  }
  return paths;
}
