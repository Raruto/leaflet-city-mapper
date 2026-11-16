import { clipTerrainPolygon } from './clipTerrainPolygon.js';

/**
 * Emit a clipped path polygon on both triangles of one terrain grid cell.
 *
 * @param {Function} point Terrain-aware pixel projection.
 * @param {Array<number>} target Destination vertices.
 * @param {Array<L.Point>} cell Path polygon clipped to the grid cell.
 * @param {number} diagonal Sum of pixel coordinates along the cell diagonal.
 */
export function appendTerrainCell(point, target, cell, diagonal) {
  let half, part, i;
  for (half = 0; half < 2; half++) {
    part = clipTerrainPolygon(cell, 2, diagonal, Boolean(half));
    for (i = 1; i < part.length - 1; i++) {
      target.push(...point(part[0]), ...point(part[i]), ...point(part[i + 1]));
    }
  }
}
