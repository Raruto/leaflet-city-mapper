export function bridgeEdge(context, p, q) {
  const { position, normal, color } = context;
  const length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1;
  const nx = (q[2] - p[2]) / length, nz = -(q[0] - p[0]) / length;
  let k, corner;
  for (k = 0; k < 6; k++) {
    corner = k === 0 || k === 3 || k === 5 ? p : q;
    position.push(corner[0], corner[1] - (k === 2 || k >= 4 ? 1.2 : 0), corner[2]);
    normal.push(nx, 0, nz); color.push(0.6, 0.58, 0.54);
  }
}
