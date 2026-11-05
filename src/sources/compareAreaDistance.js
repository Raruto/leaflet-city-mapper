export function compareAreaDistance(a, b) {
  return Math.hypot(a[1].x - a[2].x, a[1].y - a[2].y) -
    Math.hypot(b[1].x - b[2].x, b[1].y - b[2].y);
}
