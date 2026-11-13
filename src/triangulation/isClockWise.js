/**
 * Determine a planar ring's winding from its signed area.
 *
 * @param {Object[]} points Ring points with x and y coordinates.
 *
 * @returns {boolean} Whether the `{x, y}` points are in clockwise order.
 */
export function isClockWise(points) {
  let area = 0;
  let i, a, b;
  for (i = 0; i < points.length; i++) {
    a = points[i], b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area < 0;
}
