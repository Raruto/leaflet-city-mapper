/** Dashed lane outline, in layer-local metres. */

export function routeGeometry(lanes) {
  const position = [], normal = [], color = [];
  for (const { points, lengths } of lanes) for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const dx = b[0] - a[0], dz = b[1] - a[1], length = lengths[i] - lengths[i - 1];
    if (!length) continue;
    const x = -dz / length * 2.5, z = dx / length * 2.5;
    for (let distance = Math.floor(lengths[i - 1] / 30) * 30; distance < lengths[i]; distance += 30) {
      const start = Math.max(0, (distance - lengths[i - 1]) / length);
      const end = Math.min(1, (distance + 18 - lengths[i - 1]) / length);
      if (end <= start) continue;
      const p = [a[0] + dx * start, a[1] + dz * start], q = [a[0] + dx * end, a[1] + dz * end], y = a[2] + 0.4;
      for (const point of [[p[0] - x, p[1] - z], [p[0] + x, p[1] + z], [q[0] + x, q[1] + z],
      [p[0] - x, p[1] - z], [q[0] + x, q[1] + z], [q[0] - x, q[1] - z]]) {
        position.push(point[0], y, point[1]); normal.push(0, 1, 0); color.push(0.08, 0.7, 0.85);
      }
    }
  }
  return { position, normal, color };
}
