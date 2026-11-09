import { projectVectorPoint } from './projectVectorPoint.js';
import { simplifyVectorPath } from './simplifyVectorPath.js';

export function projectVectorPaths(geometry, coords, extent, tolerance) {
  const paths = /* alloc */ [];
  let path, simplified, projected, point;
  for (path of geometry) {
    simplified = simplifyVectorPath(path, tolerance);
    if (simplified.length < 3 && Math.hypot(simplified.at(-1)[0] - simplified[0][0], simplified.at(-1)[1] - simplified[0][1]) < tolerance * 2) continue;
    projected = /* alloc */ [];
    for (point of simplified) projected.push(projectVectorPoint(point, coords, extent));
    paths.push(projected);
  }
  return paths;
}
