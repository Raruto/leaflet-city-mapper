export function pointOf(point) {
  return /* allocation: required -- The returned mutable point must not alias the caller's input. */ new L.Point(
    Array.isArray(point) ? point[0] : point.x, Array.isArray(point) ? point[1] : point.y);
}
