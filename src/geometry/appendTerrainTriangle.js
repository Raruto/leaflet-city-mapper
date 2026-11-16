import { clipTerrainPolygon } from './clipTerrainPolygon.js';

/**
 * Drape a path triangle by clipping it to the streamed terrain's grid triangles.
 *
 * @param {Object} state Native path state with visible terrain bounds.
 * @param {Function} point Terrain-aware pixel projection.
 * @param {Array<number>} target Destination vertices.
 * @param {L.Point} a First vertex.
 * @param {L.Point} b Second vertex.
 * @param {L.Point} c Third vertex.
 *
 * @returns {number} New destination length.
 */
export function appendTerrainTriangle(state, point, target, a, b, c) {
  const bounds = state.terrainBounds;
  const size = 8 * 2 ** (state.map.getZoom() - (state.terrainZoom ?? Math.round(state.map.getZoom())));
  let polygon = /* alloc */ [a, b, c];
  polygon = clipTerrainPolygon(polygon, 0, bounds.min.x, true);
  polygon = clipTerrainPolygon(polygon, 0, bounds.max.x, false);
  polygon = clipTerrainPolygon(polygon, 1, bounds.min.y, true);
  polygon = clipTerrainPolygon(polygon, 1, bounds.max.y, false);
  let minY = Infinity, maxY = -Infinity, minX, maxX, vertex, row, col, strip, cell, half, part, i;
  for (vertex of polygon) {
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
  }
  for (row = Math.floor(minY / size); row < Math.ceil(maxY / size); row++) {
    strip = clipTerrainPolygon(polygon, 1, row * size, true);
    strip = clipTerrainPolygon(strip, 1, (row + 1) * size, false);
    minX = Infinity; maxX = -Infinity;
    for (vertex of strip) {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
    }
    for (col = Math.floor(minX / size); col < Math.ceil(maxX / size); col++) {
      cell = clipTerrainPolygon(strip, 0, col * size, true);
      cell = clipTerrainPolygon(cell, 0, (col + 1) * size, false);
      for (half = 0; half < 2; half++) {
        part = clipTerrainPolygon(cell, 2, (col + row + 1) * size, Boolean(half));
        for (i = 1; i < part.length - 1; i++) {
          target.push(...point(part[0]), ...point(part[i]), ...point(part[i + 1]));
        }
      }
    }
  }
  return target.length;
}
