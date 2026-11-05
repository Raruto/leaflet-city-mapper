export function inside(point, ring) {
  let result = false;
  let i, j, a, b;
  for (i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a = ring[i], b = ring[j];
    if ((a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}
