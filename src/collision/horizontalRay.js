// Möller-Trumbore for the horizontal ray (ox, oy, oz) + d·(dx, 0, dz) against triangle t; returns d or -1.
export function horizontalRay(v, t, ox, oy, oz, dx, dz) {
  const i = t * 9, ex = v[i + 3] - v[i], ey = v[i + 4] - v[i + 1], ez = v[i + 5] - v[i + 2];
  const fx = v[i + 6] - v[i], fy = v[i + 7] - v[i + 1], fz = v[i + 8] - v[i + 2];
  const px = -dz * fy, py = dz * fx - dx * fz, pz = dx * fy, det = ex * px + ey * py + ez * pz;
  if (Math.abs(det) < 1e-9) return -1;
  const tx = ox - v[i], ty = oy - v[i + 1], tz = oz - v[i + 2], u = (tx * px + ty * py + tz * pz) / det;
  if (u < 0 || u > 1) return -1;
  const qx = ty * ez - tz * ey, qy = tz * ex - tx * ez, qz = tx * ey - ty * ex, w = (dx * qx + dz * qz) / det;
  if (w < 0 || u + w > 1) return -1;
  return (fx * qx + fy * qy + fz * qz) / det;
}
