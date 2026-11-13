import { groundOffset } from '../sources/groundOffset.js';

/**
 * Append an oriented triangle and its normals, colors and optional UVs to an area.
 *
 * @param {Object} context Area geometry buffers and options.
 * @param {Object} a First projected vertex.
 * @param {number} ah First vertex height.
 * @param {Object} b Second projected vertex.
 * @param {number} bh Second vertex height.
 * @param {Object} c Third projected vertex.
 * @param {number} ch Third vertex height.
 * @param {number} nx Normal x component.
 * @param {number} ny Normal y component.
 * @param {number} nz Normal z component.
 * @param {Object} color RGB color.
 */
export function addTriangle(context, a, ah, b, bh, c, ch, nx, ny, nz, color) {
  const { backend: layer, positions, normals, colors, uvs } = context;
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
  if (layer.options.nightLight) uvs.push(...a.uv, ...b.uv, ...c.uv);
}
