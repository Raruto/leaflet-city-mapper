/** Dashed lane outline, in layer-local metres. */

export function routeGeometry(lanes) {
  const position = /* allocation: required -- Returned route geometry retains its vertex positions. */ [];
  const normal = /* allocation: required -- Returned route geometry retains its vertex normals. */ [];
  const color = /* allocation: required -- Returned route geometry retains its vertex colors. */ [];
  let points, lengths, properties, raw, rgb, r, g, blue, i, a, b, dx, dz, length, x, z, distance, start, end;
  let px, py, pz, qx, qy, qz, vertex;
  for ({ points, lengths, properties } of lanes) {
    raw = properties?.route_color;
    rgb = /^[\da-f]{6}$/i.test(raw) ? Number.parseInt(raw, 16) : null;
    r = rgb === null ? 0.08 : (rgb >> 16 & 255) / 255;
    g = rgb === null ? 0.7 : (rgb >> 8 & 255) / 255;
    blue = rgb === null ? 0.85 : (rgb & 255) / 255;
    for (i = 1; i < points.length; i++) {
      a = points[i - 1], b = points[i];
      dx = b[0] - a[0], dz = b[1] - a[1], length = lengths[i] - lengths[i - 1];
      if (!length) continue;
      x = -dz / length * 2.5, z = dx / length * 2.5;
      for (distance = Math.floor(lengths[i - 1] / 30) * 30; distance < lengths[i]; distance += 30) {
        start = Math.max(0, (distance - lengths[i - 1]) / length);
        end = Math.min(1, (distance + 18 - lengths[i - 1]) / length);
        if (end <= start) continue;
        px = a[0] + dx * start;
        pz = a[1] + dz * start;
        py = a[2] + (b[2] - a[2]) * start + 0.4;
        qx = a[0] + dx * end;
        qz = a[1] + dz * end;
        qy = a[2] + (b[2] - a[2]) * end + 0.4;
        for (vertex = 0; vertex < 6; vertex++) {
          if (vertex === 0 || vertex === 3) position.push(px - x, py, pz - z);
          else if (vertex === 1) position.push(px + x, py, pz + z);
          else if (vertex === 5) position.push(qx - x, qy, qz - z);
          else position.push(qx + x, qy, qz + z);
          normal.push(0, 1, 0);
          color.push(r, g, blue);
        }
      }
    }
  }
  return /* allocation: required -- Each route mesh owns an independent geometry result. */ { position, normal, color };
}
