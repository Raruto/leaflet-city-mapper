import { hiddenLightHit } from './hiddenLightHit.js';

/**
 * Compute ray-triangle distance using the renderer's culling and light-halo rules.
 *
 * @param {Object} mesh Mesh containing material and geometry attributes.
 * @param {number} i Triangle's first vertex or index offset.
 * @param {number[]} a First vertex.
 * @param {number[]} b Second vertex.
 * @param {number[]} c Third vertex.
 * @param {number[]} origin Local ray origin.
 * @param {number[]} direction Local ray direction.
 * @param {number} night Night-light intensity.
 *
 * @returns {number} Signed ray distance, or Infinity when the hit is rejected.
 */
export function triangleDistance(mesh, i, a, b, c, origin, direction, night) {
  const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2];
  const fx = c[0] - a[0], fy = c[1] - a[1], fz = c[2] - a[2];
  const px = direction[1] * fz - direction[2] * fy;
  const py = direction[2] * fx - direction[0] * fz;
  const pz = direction[0] * fy - direction[1] * fx;
  const det = ex * px + ey * py + ez * pz;
  if (mesh.program.cullMode === 'none' || mesh.program.cullFace === null
    ? Math.abs(det) < 1e-9 : det < 1e-9) return Infinity;
  const tx = origin[0] - a[0], ty = origin[1] - a[1], tz = origin[2] - a[2];
  const u = (tx * px + ty * py + tz * pz) / det;
  if (u < 0 || u > 1) return Infinity;
  const qx = ty * ez - tz * ey, qy = tz * ex - tx * ez, qz = tx * ey - ty * ex;
  const v = (direction[0] * qx + direction[1] * qy + direction[2] * qz) / det;
  if (v < 0 || u + v > 1) return Infinity;
  if (hiddenLightHit(mesh, i, u, v, night)) return Infinity;
  return (fx * qx + fy * qy + fz * qz) / det;
}
