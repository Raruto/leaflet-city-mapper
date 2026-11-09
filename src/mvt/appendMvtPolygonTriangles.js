import { tessellateVectorRings } from './tessellateVectorRings.js';
import { triangulate } from '../triangulation/triangulate.js';
import { isMvtFallbackError } from './isMvtFallbackError.js';

export function appendMvtPolygonTriangles(rings, paths, vertices, triangles) {
  let indices, index, triangle, points, i = 0;
  try {
    indices = triangulate(paths[0], paths.slice(1));
    for (triangle of indices) {
      points = /* alloc */ [];
      for (index of triangle) points.push(/* alloc */ [vertices[index].x, vertices[index].y]);
      triangles.push(points);
    }
  } catch (error) {
    if (!isMvtFallbackError(error)) throw error;
    indices = tessellateVectorRings(rings);
    for (; i < indices.length; i++) triangles.push(indices[i]);
  }
}
