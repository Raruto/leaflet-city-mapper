import { projectVectorTriangles } from './projectVectorTriangles.js';
import { projectVectorPaths } from './projectVectorPaths.js';
import { vectorTolerance } from './vectorTolerance.js';

export function vectorFeaturePaths(job, layer, entry, feature) {
  const cache = entry.type === 'fill' ? job.triangles : job.projected;
  let paths = cache.get(feature);
  if (!paths) {
    const tolerance = vectorTolerance(job, layer);
    paths = entry.type === 'fill'
      ? projectVectorTriangles(feature.geometry, job.coords, layer.extent, tolerance)
      : projectVectorPaths(feature.geometry, job.coords, layer.extent, tolerance);
    cache.set(feature, paths);
  }
  return paths;
}
