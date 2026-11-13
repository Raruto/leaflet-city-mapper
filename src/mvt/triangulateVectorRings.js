import { appendMvtPolygonTriangles } from './appendMvtPolygonTriangles.js';
import { groupMvtPolygons } from './groupMvtPolygons.js';
import { mvtPathsVertices } from './mvtPathsVertices.js';
import { mvtPolygonPaths } from './mvtPolygonPaths.js';

/**
 * Reuse City Mapper's triangulator in tile space, with even-odd tessellation
 * for quantized touching/crossing rings. Output triangles omit their closure.
 *
 * @param {Array} rings Closed MVT polygon rings.
 *
 * @returns {Array} Triangle coordinate arrays.
 */
export function triangulateVectorRings(rings) {
  const polygons = groupMvtPolygons(rings), triangles = /* alloc */ [];
  let polygon, paths, vertices;
  for (polygon of polygons) {
    paths = mvtPolygonPaths(polygon);
    vertices = mvtPathsVertices(paths);
    appendMvtPolygonTriangles(polygon, paths, vertices, triangles);
  }
  return triangles;
}
