/** Dashed lane outline, in layer-local metres. */

export function routeGeometry(lanes) {
  const position = [], normal = [], color = [];
  let points, lengths, properties, raw, rgb, tint, i, a, b, dx, dz, length, x, z, distance, start, end;
  let p, q, point;
  for ({ points, lengths, properties } of lanes) {
    raw = properties?.route_color;
    rgb = /^[\da-f]{6}$/i.test(raw) ? Number.parseInt(raw, 16) : null;
    tint = rgb === null ? [0.08, 0.7, 0.85]
      : [(rgb >> 16 & 255) / 255, (rgb >> 8 & 255) / 255, (rgb & 255) / 255];
    for (i = 1; i < points.length; i++) {
      a = points[i - 1], b = points[i];
      dx = b[0] - a[0], dz = b[1] - a[1], length = lengths[i] - lengths[i - 1];
      if (!length) continue;
      x = -dz / length * 2.5, z = dx / length * 2.5;
      for (distance = Math.floor(lengths[i - 1] / 30) * 30; distance < lengths[i]; distance += 30) {
        start = Math.max(0, (distance - lengths[i - 1]) / length);
        end = Math.min(1, (distance + 18 - lengths[i - 1]) / length);
        if (end <= start) continue;
        p = [a[0] + dx * start, a[1] + dz * start, a[2] + (b[2] - a[2]) * start + 0.4];
        q = [a[0] + dx * end, a[1] + dz * end, a[2] + (b[2] - a[2]) * end + 0.4];
        for (point of [[p[0] - x, p[2], p[1] - z], [p[0] + x, p[2], p[1] + z], [q[0] + x, q[2], q[1] + z],
        [p[0] - x, p[2], p[1] - z], [q[0] + x, q[2], q[1] + z], [q[0] - x, q[2], q[1] - z]]) {
          position.push(...point); normal.push(0, 1, 0); color.push(...tint);
        }
      }
    }
  }
  return { position, normal, color };
}
