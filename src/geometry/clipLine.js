/** Clip a geographic line to [west, south, east, north] without joining disjoint pieces. */
export function clipLine(line, bounds) {
  const pieces = [];
  let current;
  for (let i = 1; i < line.length; i++) {
    if (samePoint(line[i - 1], line[i])) continue;
    const segment = clipSegment(line[i - 1], line[i], bounds);
    if (!segment) {
      current = null;
      continue;
    }
    if (current && samePoint(current.at(-1), segment[0])) current.push(segment[1]);
    else {
      current = segment;
      pieces.push(current);
    }
  }
  return pieces;
}

export function samePoint(a, b) {
  return Math.abs(a[0] - b[0]) < 1e-10 && Math.abs(a[1] - b[1]) < 1e-10;
}

function clipSegment(a, b, bounds) {
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
