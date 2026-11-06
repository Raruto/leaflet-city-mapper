export function bridgeFaces(context, points, triangles) {
  const { position, normal, color } = context;
  let a, b, c, pa, pb, pc, i, k, p;
  for ([a, b, c] of triangles) {
    // Counter-clockwise seen from above, so double-sided shading keeps the top lit.
    pa = points[a]; pb = points[b]; pc = points[c];
    if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) { i = b; b = c; c = i; }
    for (k = 0; k < 6; k++) {
      i = k === 0 || k === 3 ? a : k === 1 || k === 5 ? b : c;
      p = points[i];
      position.push(p[0], p[1] - (k >= 3 ? 1.2 : 0), p[2]);
      normal.push(0, k >= 3 ? -1 : 1, 0); color.push(0.6, 0.58, 0.54);
    }
  }
}
