import { area } from './area.js';
import { cross } from './cross.js';

/**
 * Check that triangle area matches the outer ring area minus its holes.
 *
 * @param {Object[][]} rings Outer ring followed by hole rings.
 * @param {Object[]} vertices Indexed planar vertices.
 * @param {number[][]} result Triangles of vertex indices.
 *
 * @throws {Error} If the expected area is nonpositive or the triangle area differs.
 */
export function validateArea(rings, vertices, result) {
  let holeArea = 0, actual = 0, i, triangle;
  for (i = 1; i < rings.length; i++) holeArea += area(rings[i]);
  const expected = area(rings[0]) - holeArea;
  for (triangle of result) actual += cross(vertices[triangle[0]], vertices[triangle[1]], vertices[triangle[2]]) / 2;
  if (expected <= 0 || Math.abs(actual - expected) > Math.max(1e-7, expected * 1e-8)) throw /* alloc */ new Error('Polygon triangulation area mismatch');
}
