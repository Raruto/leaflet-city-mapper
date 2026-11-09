import { projectVectorTriangles } from './projectVectorTriangles.js';
import { projectVectorPaths } from './projectVectorPaths.js';

export function vectorFeaturePaths(job, layer, entry, feature) {
  const cache = entry.type === 'fill' ? job.triangles : job.projected;
  let paths = cache.get(feature);
  if (!paths) {
    const tolerance = layer.extent / 256 / 2 ** Math.max(0, job.maxZoom - job.coords.z) * 0.35;
    paths = entry.type === 'fill'
      ? projectVectorTriangles(feature.geometry, job.coords, layer.extent)
      : projectVectorPaths(feature.geometry, job.coords, layer.extent, tolerance);
    cache.set(feature, paths);
  }
  return paths;
}
