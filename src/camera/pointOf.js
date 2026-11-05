export function pointOf(point) {
  return Array.isArray(point) ? new L.Point(point[0], point[1]) : new L.Point(point.x, point.y);
}
