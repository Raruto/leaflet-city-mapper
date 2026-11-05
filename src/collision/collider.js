import { CELL } from '../constants/CELL.js';
import { colliders } from '../constants/colliders.js';


export function collider(mesh) {
  let c = colliders.get(mesh.geometry);
  if (c) return c;
  const m = mesh.worldMatrix, { position: { data: p }, index, normal, uv } = mesh.geometry.attributes;

  const count = index ? index.count : p.length / 3, tri = [], nrm = [], cells = new Map(), v = [];

  let i, first, k, j, x, y, z, ex, ey, ez, fx, fy, fz, nx, nz, ny, length, a, h, t, ix, iz, key;
  for (i = 0; i < count; i += 3) {
    first = index ? index.data[i] : i;
    // Streetlight halos (uv.x <= 2, see scene/picking.js) are light, not matter.
    if (mesh.program.nightLight && uv && uv.data[first * 2] <= 2) {
      continue;
    }
    for (k = 0; k < 3; k++) {
      j = (index ? index.data[i + k] : i + k) * 3, x = p[j], y = p[j + 1], z = p[j + 2];
      v[k * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
      v[k * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
      v[k * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    }
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

    for (ix = Math.floor(Math.min(v[0], v[3], v[6]) / CELL); ix <= Math.floor(Math.max(v[0], v[3], v[6]) / CELL); ix++)
      for (iz = Math.floor(Math.min(v[2], v[5], v[8]) / CELL); iz <= Math.floor(Math.max(v[2], v[5], v[8]) / CELL); iz++) {
        key = ix + ',' + iz;
        if (!cells.has(key)) {
          cells.set(key, []);
        }
        cells.get(key).push(t);
      }
  }
  c = {
    tri: Float32Array.from(tri),
    nrm: Float32Array.from(nrm),
    cells,
    origin: [m[12], m[13], m[14]]
  };
  colliders.set(mesh.geometry, c);
  return c;
}
