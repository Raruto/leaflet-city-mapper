export function appendRouteDash(position, normal, color, a, b, dx, dz, x, z, start, end, r, g, blue) {
  const px = a[0] + dx * start, pz = a[1] + dz * start;
  const py = a[2] + (b[2] - a[2]) * start + 0.4;
  const qx = a[0] + dx * end, qz = a[1] + dz * end;
  const qy = a[2] + (b[2] - a[2]) * end + 0.4;
  let vertex;
  for (vertex = 0; vertex < 6; vertex++) {
    if (vertex === 0 || vertex === 3) position.push(px - x, py, pz - z);
    else if (vertex === 1) position.push(px + x, py, pz + z);
    else if (vertex === 5) position.push(qx - x, qy, qz - z);
    else position.push(qx + x, qy, qz + z);
    normal.push(0, 1, 0);
    color.push(r, g, blue);
  }
}
