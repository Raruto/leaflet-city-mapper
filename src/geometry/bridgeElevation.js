/** Height inside a bridge deck, or null outside its triangles. */
export function bridgeElevation(point, bridges) {
  // Bridges bucketed by 64 DEM pixels.
  let bridge, a, b, c, d, u, v;
  for (bridge of bridges?.get(`${Math.floor(point.x / 64)}/${Math.floor(point.y / 64)}`) || []) {
    if (point.x < bridge.min[0] || point.x > bridge.max[0] || point.y < bridge.min[1] || point.y > bridge.max[1]) {
      continue;
    }
    for ([a, b, c] of bridge.triangles) {
      d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      u = ((b[1] - c[1]) * (point.x - c[0]) + (c[0] - b[0]) * (point.y - c[1])) / d;
      v = ((c[1] - a[1]) * (point.x - c[0]) + (a[0] - c[0]) * (point.y - c[1])) / d;
      if (u >= 0 && v >= 0 && u + v <= 1) {
        return u * a[2] + v * b[2] + (1 - u - v) * c[2];
      }
    }
  }
  return null;
}
