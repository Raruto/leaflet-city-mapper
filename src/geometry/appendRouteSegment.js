import { appendRouteDash } from './appendRouteDash.js';

export function appendRouteSegment(position, normal, color, points, lengths, i, r, g, blue) {
  const a = points[i - 1], b = points[i];
  const dx = b[0] - a[0], dz = b[1] - a[1], length = lengths[i] - lengths[i - 1];
  if (!length) return;
  const x = -dz / length * 2.5, z = dx / length * 2.5;
  let distance, start, end;
  for (distance = Math.floor(lengths[i - 1] / 30) * 30; distance < lengths[i]; distance += 30) {
    start = Math.max(0, (distance - lengths[i - 1]) / length);
    end = Math.min(1, (distance + 18 - lengths[i - 1]) / length);
    if (end <= start) continue;
    appendRouteDash(position, normal, color, a, b, dx, dz, x, z, start, end, r, g, blue);
  }
}
