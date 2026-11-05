export function clipSegment(a, b, bounds) {
  const [west, south, east, north] = bounds;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy], q = [a[0] - west, east - a[0], a[1] - south, north - a[1]];
  let start = 0, end = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) start = Math.max(start, t);
      else end = Math.min(end, t);
      if (start > end) return null;
    }
  }
  if (start === end || dx === 0 && dy === 0) return null;
  return [[a[0] + start * dx, a[1] + start * dy], [a[0] + end * dx, a[1] + end * dy]];
}
