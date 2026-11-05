import { computeBounds } from "../geometry/computeBounds.js";
import { sortHits } from './sortHits.js';

/** Nearest triangle hit per mesh, sorted by world-space distance. */

export function intersectMeshes(ray, meshes, night = 0) {
  const hits = /* alloc */ [],
  a = /* alloc */ [0, 0, 0],
  b = /* alloc */ [0, 0, 0],
  c = /* alloc */ [0, 0, 0];
  const origin = /* alloc */ [0, 0, 0], direction = /* alloc */ [0, 0, 0];
  let mesh, inverse, inverseValues, value, matrix, w;
  let directionLength, near, far, i, a2, b2, position, index, instanceOffset, vertices, closest;
  let faceIndex, vertex, offset, x, y, z, ai, bi, ci, ex, ey, ez, fx, fy, fz, px, py, pz, det;
  let tx, ty, tz, u, qx, qy, qz, v, uv, idA, idB, idC, x2, y2;
  let distance, worldPoint;
  for (mesh of meshes) {
    // Test in mesh-local space; compare distances only after returning to shared world space.
    inverse = /* alloc */ new DOMMatrix(mesh.worldMatrix).invertSelf();
    inverseValues = inverse.toFloat64Array();
    for (value of inverseValues) {
      if (!Number.isFinite(value)) throw /* alloc */ new Error('Singular 3D transform');
    }
    x = ray.origin[0], y = ray.origin[1], z = ray.origin[2];
    w = inverseValues[3] * x + inverseValues[7] * y + inverseValues[11] * z + inverseValues[15];
    origin[0] = (inverseValues[0] * x + inverseValues[4] * y + inverseValues[8] * z + inverseValues[12]) / w;
    origin[1] = (inverseValues[1] * x + inverseValues[5] * y + inverseValues[9] * z + inverseValues[13]) / w;
    origin[2] = (inverseValues[2] * x + inverseValues[6] * y + inverseValues[10] * z + inverseValues[14]) / w;
    x = ray.direction[0], y = ray.direction[1], z = ray.direction[2];
    direction[0] = inverseValues[0] * x + inverseValues[4] * y + inverseValues[8] * z;
    direction[1] = inverseValues[1] * x + inverseValues[5] * y + inverseValues[9] * z;
    direction[2] = inverseValues[2] * x + inverseValues[6] * y + inverseValues[10] * z;
    directionLength = Math.hypot(...direction) || 1;
    direction[0] /= directionLength;
    direction[1] /= directionLength;
    direction[2] /= directionLength;
    // AABB slab test reuses the same local ray as the triangle test.
    if (!mesh.geometry.bounds) {
      computeBounds(mesh.geometry);
    }
    near = 0, far = Infinity;
    for (i = 0; i < 3; i++) {
      if (Math.abs(direction[i]) < 1e-12) {
        if (origin[i] < mesh.geometry.bounds.min[i] || origin[i] > mesh.geometry.bounds.max[i]) {
          far = -Infinity;
          break;
        }
      } else {
        a2 = (mesh.geometry.bounds.min[i] - origin[i]) / direction[i], b2 = (mesh.geometry.bounds.max[i] - origin[i]) / direction[i];
        near = Math.max(near, Math.min(a2, b2));
        far = Math.min(far, Math.max(a2, b2));
      }
    }
    if (far < near) {
      continue;
    }
    ({ position, index, instanceOffset } = mesh.geometry.attributes);
    vertices = index?.count || position.count;
    closest = Infinity, faceIndex = void 0;
    for (i = 0; i < vertices * (instanceOffset?.count ?? 1); i += 3) {
      vertex = instanceOffset ? i % vertices : i;
      offset = instanceOffset ? Math.floor(i / vertices) * instanceOffset.size : 0;
      x = instanceOffset?.data[offset] ?? 0;
      y = instanceOffset?.data[offset + 1] ?? 0;
      z = instanceOffset?.data[offset + 2] ?? 0;
      ai = (index ? index.data[vertex] : vertex) * position.size;
      bi = (index ? index.data[vertex + 1] : vertex + 1) * position.size;
      ci = (index ? index.data[vertex + 2] : vertex + 2) * position.size;
      a[0] = position.data[ai];
      a[1] = position.data[ai + 1];
      a[2] = position.data[ai + 2];
      b[0] = position.data[bi];
      b[1] = position.data[bi + 1];
      b[2] = position.data[bi + 2];
      c[0] = position.data[ci];
      c[1] = position.data[ci + 1];
      c[2] = position.data[ci + 2];
      if (instanceOffset) {
        a[0] = Math.fround(a[0] + x); a[1] = Math.fround(a[1] + y); a[2] = Math.fround(a[2] + z);
        b[0] = Math.fround(b[0] + x); b[1] = Math.fround(b[1] + y); b[2] = Math.fround(b[2] + z);
        c[0] = Math.fround(c[0] + x); c[1] = Math.fround(c[1] + y); c[2] = Math.fround(c[2] + z);
      }
      // Moller-Trumbore: barycentric triangle coordinates and local ray distance.
      ex = b[0] - a[0]; ey = b[1] - a[1]; ez = b[2] - a[2];
      fx = c[0] - a[0]; fy = c[1] - a[1]; fz = c[2] - a[2];
      px = direction[1] * fz - direction[2] * fy;
      py = direction[2] * fx - direction[0] * fz;
      pz = direction[0] * fy - direction[1] * fx;
      det = ex * px + ey * py + ez * pz;
      if (mesh.program.cullMode === 'none' || mesh.program.cullFace === null
        ? Math.abs(det) < 1e-9 : det < 1e-9) {
        continue;
      }
      tx = origin[0] - a[0]; ty = origin[1] - a[1]; tz = origin[2] - a[2];
      u = (tx * px + ty * py + tz * pz) / det;
      if (u < 0 || u > 1) {
        continue;
      }
      qx = ty * ez - tz * ey; qy = tz * ex - tx * ez; qz = tx * ey - ty * ex;
      v = (direction[0] * qx + direction[1] * qy + direction[2] * qz) / det;
      if (v < 0 || u + v > 1) {
        continue;
      }
      if (mesh.program.nightLight) {
        uv = mesh.geometry.attributes.uv.data;
        idA = index ? index.data[i] : i; idB = index ? index.data[i + 1] : i + 1; idC = index ? index.data[i + 2] : i + 2;
        x2 = uv[idA * 2] * (1 - u - v) + uv[idB * 2] * u + uv[idC * 2] * v;
        y2 = uv[idA * 2 + 1] * (1 - u - v) + uv[idB * 2 + 1] * u + uv[idC * 2 + 1] * v;
        if (x2 <= 2 && (!night || x2 * x2 + y2 * y2 > 0.9)) continue;
      }
      distance = (fx * qx + fy * qy + fz * qz) / det;
      if (distance > 0 && distance < closest) {
        closest = distance; faceIndex = i / 3;
      }
    }
    if (faceIndex === undefined) continue;
    x = direction[0] * closest + origin[0];
    y = direction[1] * closest + origin[1];
    z = direction[2] * closest + origin[2];
    matrix = mesh.worldMatrix;
    w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
    worldPoint = /* alloc */ [
      (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
      (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
      (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w,
    ];
    hits.push(/* alloc */ {
      faceIndex,
      object: mesh,
      point: worldPoint,
      distance: Math.hypot(
        worldPoint[0] - ray.origin[0],
        worldPoint[1] - ray.origin[1],
        worldPoint[2] - ray.origin[2]
      )
    });
  }
  return sortHits(hits);
}
