import { colliders } from '../weakmaps/colliders.js';
import { indexTriangle } from './indexTriangle.js';
import { readTriangle } from './readTriangle.js';
import { vertexCount } from './vertexCount.js';

/**
 * Cache world-space collision triangles and their grid cells, rebuilding when geometry or rotation/scale changes.
 *
 * @param {Object} mesh Mesh containing geometry and a world matrix.
 *
 * @returns {Object} Cached triangle, normal, feature and grid data.
 */
export function collider(mesh) {
  const m = mesh.worldMatrix;
  let c = colliders.get(mesh), i;
  if (c && c.geometry === mesh.geometry) {
    for (i = 0; i < 12; i++) {
      if (i % 4 !== 3 && c.matrix[i] !== m[i]) break;
    }
    if (i === 12) return c;
  }
  const { position, index, normal, uv, instanceOffset } = mesh.geometry.attributes;

  const vertices = vertexCount(position, index);
  const count = vertices * (instanceOffset?.count ?? 1);
  const tri = /* alloc */ [];
  const nrm = /* alloc */ [];
  const features = /* alloc */ [];
  const cells = /* alloc */ new Map();
  const a = /* alloc */ [0, 0, 0], b = /* alloc */ [0, 0, 0], d = /* alloc */ [0, 0, 0];
  const v = /* alloc */ [];

  const ranges = mesh.extras?.featureFaces;
  let first, j, ex, ey, ez, fx, fy, fz, nx, nz, ny, length, h, t, feature = 0, maxX = -Infinity;
  for (i = 0; i < count; i += 3) {
    while (ranges && feature < ranges.length && i / 3 >= ranges[feature].faceEnd) feature++;
    first = index ? index.data[i % vertices] : i % vertices;
    // Streetlight halos (uv.x <= 2, see scene/picking.js) are light, not matter.
    if (mesh.program.nightLight && uv && uv.data[first * 2] <= 2) {
      continue;
    }
    readTriangle(mesh, i, a, b, d);
    v[0] = m[0] * a[0] + m[4] * a[1] + m[8] * a[2] + m[12];
    v[1] = m[1] * a[0] + m[5] * a[1] + m[9] * a[2] + m[13];
    v[2] = m[2] * a[0] + m[6] * a[1] + m[10] * a[2] + m[14];
    v[3] = m[0] * b[0] + m[4] * b[1] + m[8] * b[2] + m[12];
    v[4] = m[1] * b[0] + m[5] * b[1] + m[9] * b[2] + m[13];
    v[5] = m[2] * b[0] + m[6] * b[1] + m[10] * b[2] + m[14];
    v[6] = m[0] * d[0] + m[4] * d[1] + m[8] * d[2] + m[12];
    v[7] = m[1] * d[0] + m[5] * d[1] + m[9] * d[2] + m[13];
    v[8] = m[2] * d[0] + m[6] * d[1] + m[10] * d[2] + m[14];
    ex = v[3] - v[0], ey = v[4] - v[1], ez = v[5] - v[2], fx = v[6] - v[0], fy = v[7] - v[1], fz = v[8] - v[2];

    nx = ey * fz - ez * fy, nz = ex * fy - ey * fx;

    ny = ez * fx - ex * fz, length = Math.hypot(nx, ny, nz);

    if (!length || Math.abs(ny) > 0.9 * length) {
      continue;
    }

    if (normal) {
      // The stored normal tells the outside, whatever the winding.
      j = first * 3;
      if ((m[0] * normal.data[j] + m[4] * normal.data[j + 1] + m[8] * normal.data[j + 2]) * nx +
        (m[2] * normal.data[j] + m[6] * normal.data[j + 1] + m[10] * normal.data[j + 2]) * nz < 0) { nx = -nx; nz = -nz; }
    }

    h = Math.hypot(nx, nz), t = nrm.length / 2;

    tri.push(...v);
    maxX = Math.max(maxX, v[0], v[3], v[6]);
    nrm.push(nx / h, nz / h);
    features.push(ranges ? feature : instanceOffset ? Math.floor(i / vertices) : 0);

    indexTriangle(cells, v, t);
  }
  c = /* alloc */ {
    tri: Float32Array.from(tri),
    nrm: Float32Array.from(nrm),
    features: Uint32Array.from(features),
    ranges,
    cells,
    maxX,
    geometry: mesh.geometry,
    matrix: Array.from(m),
    origin: /* alloc */ [m[12], m[13], m[14]]
  };
  colliders.set(mesh, c);
  return c;
}
