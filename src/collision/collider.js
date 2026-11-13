import { colliders } from '../weakmaps/colliders.js';
import { advanceFeature } from './advanceFeature.js';
import { cachedCollider } from './cachedCollider.js';
import { flipsNormal } from './flipsNormal.js';
import { indexTriangle } from './indexTriangle.js';
import { readTriangle } from './readTriangle.js';
import { transformVertices } from './transformVertices.js';
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
  const cached = cachedCollider(mesh);
  if (cached) return cached;
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
  let i, first, j, ex, ey, ez, fx, fy, fz, nx, nz, ny, length, h, t, feature = 0, maxX = -Infinity;
  for (i = 0; i < count; i += 3) {
    feature = advanceFeature(ranges, feature, i / 3);
    first = index ? index.data[i % vertices] : i % vertices;
    // Streetlight halos (uv.x <= 2, see scene/picking.js) are light, not matter.
    if (mesh.program.nightLight && uv && uv.data[first * 2] <= 2) {
      continue;
    }
    readTriangle(mesh, i, a, b, d);
    transformVertices(v, a, b, d, m);
    ex = v[3] - v[0], ey = v[4] - v[1], ez = v[5] - v[2], fx = v[6] - v[0], fy = v[7] - v[1], fz = v[8] - v[2];

    nx = ey * fz - ez * fy, nz = ex * fy - ey * fx;

    ny = ez * fx - ex * fz, length = Math.hypot(nx, ny, nz);

    if (!length || Math.abs(ny) > 0.9 * length) {
      continue;
    }

    if (normal) {
      // The stored normal tells the outside, whatever the winding.
      j = first * 3;
      if (flipsNormal(m, normal.data, j, nx, nz)) { nx = -nx; nz = -nz; }
    }

    h = Math.hypot(nx, nz), t = nrm.length / 2;

    tri.push(...v);
    maxX = Math.max(maxX, v[0], v[3], v[6]);
    nrm.push(nx / h, nz / h);
    features.push(ranges ? feature : instanceOffset ? Math.floor(i / vertices) : 0);

    indexTriangle(cells, v, t);
  }
  const c = /* alloc */ {
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
