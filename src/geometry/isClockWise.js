/**
 * @returns {boolean} Whether the `{x, y}` points are in clockwise order.
 */

export function isClockWise(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area < 0;
}
