import { colliders } from '../weakmaps/colliders.js';
import { transformTriangle } from './transformTriangle.js';
import { indexTriangle } from './indexTriangle.js';


export function collider(mesh) {
  let c = colliders.get(mesh.geometry);
  if (c) return c;
  const m = mesh.worldMatrix, { position: { data: p }, index, normal, uv } = mesh.geometry.attributes;

  const count = index ? index.count : p.length / 3;
  const tri = /* alloc */ [];
  const nrm = /* alloc */ [];
  const cells = /* alloc */ new Map();
  const v = /* alloc */ [];

  let i, first, j, ex, ey, ez, fx, fy, fz, nx, nz, ny, length, a, h, t;
  for (i = 0; i < count; i += 3) {
    first = index ? index.data[i] : i;
    // Streetlight halos (uv.x <= 2, see scene/picking.js) are light, not matter.
    if (mesh.program.nightLight && uv && uv.data[first * 2] <= 2) {
      continue;
    }
    transformTriangle(v, p, index, i, m);
    ex = v[3] - v[0], ey = v[4] - v[1], ez = v[5] - v[2], fx = v[6] - v[0], fy = v[7] - v[1], fz = v[8] - v[2];

    nx = ey * fz - ez * fy, nz = ex * fy - ey * fx;

    ny = ez * fx - ex * fz, length = Math.hypot(nx, ny, nz);

    if (!length || Math.abs(ny) > 0.9 * length) {
      continue;
    }

    if (normal) {
      // The stored normal tells the outside, whatever the winding.
      j = first * 3, a = normal.data;
      if ((m[0] * a[j] + m[4] * a[j + 1] + m[8] * a[j + 2]) * nx + (m[2] * a[j] + m[6] * a[j + 1] + m[10] * a[j + 2]) * nz < 0) { nx = -nx; nz = -nz; }
    }

    h = Math.hypot(nx, nz), t = nrm.length / 2;

    tri.push(...v);
    nrm.push(nx / h, nz / h);

    indexTriangle(cells, v, t);
  }
  c = /* alloc */ {
    tri: Float32Array.from(tri),
    nrm: Float32Array.from(nrm),
    cells,
    origin: /* alloc */ [m[12], m[13], m[14]]
  };
  colliders.set(mesh.geometry, c);
  return c;
}
