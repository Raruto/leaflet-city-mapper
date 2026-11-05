export function clipSegment(a, b, bounds) {
  const [west, south, east, north] = bounds;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let start = 0, end = 1;
  let i, t, p, q;
  for (i = 0; i < 4; i++) {
    p = i === 0 ? -dx : i === 1 ? dx : i === 2 ? -dy : dy;
    q = i === 0 ? a[0] - west : i === 1 ? east - a[0] : i === 2 ? a[1] - south : north - a[1];
    if (p === 0) {
      if (q < 0) return null;
    } else {
      t = q / p;
      if (p < 0) start = Math.max(start, t);
      else end = Math.min(end, t);
      if (start > end) return null;
    }
  }
  if (start === end || dx === 0 && dy === 0) return null;
  return /* alloc */ [
    /* alloc */ [a[0] + start * dx, a[1] + start * dy],
    /* alloc */ [a[0] + end * dx, a[1] + end * dy],
  ];
}
