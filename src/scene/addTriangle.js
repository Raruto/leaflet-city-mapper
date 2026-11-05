import { groundOffset } from './groundOffset.js';

export function addTriangle(context, a, ah, b, bh, c, ch, nx, ny, nz, color) {
  const { backend, positions, normals, colors, uvs } = context;
  const ux = b.x - a.x, uy = bh - ah, uz = a.y - b.y;
  const vx = c.x - a.x, vy = ch - ah, vz = a.y - c.y;
  if ((uy * vz - uz * vy) * nx + (uz * vx - ux * vz) * ny + (ux * vy - uy * vx) * nz < 0) {
    const point = b, height = bh;
    b = c; bh = ch; c = point; ch = height;
  }
  positions.push(a.x, ah + groundOffset(a), -a.y,
    b.x, bh + groundOffset(b), -b.y,
    c.x, ch + groundOffset(c), -c.y);
  normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  colors.push(color.r, color.g, color.b, color.r, color.g, color.b, color.r, color.g, color.b);
  if (backend.options.nightLight) uvs.push(...a.uv, ...b.uv, ...c.uv);
}
