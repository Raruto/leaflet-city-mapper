import { locateTraffic } from '../traffic/locateTraffic.js';
import { boxNormal } from './boxNormal.js';
import { trafficRay } from './trafficRay.js';
import { missesBox } from './missesBox.js';
import { slabDistance } from './slabDistance.js';
import { slabMiss } from './slabMiss.js';

/**
 * Test a walker point or movement ray against one traffic trip, updating data when it is the nearest hit.
 *
 * @param {Object} state Traffic layer state.
 * @param {Object} trip Trip to test.
 * @param {Object} root Traffic root with position and scale arrays.
 * @param {Object} bounds Local vehicle bounds.
 * @param {number} x Walker world-space x coordinate.
 * @param {number} y Walker world-space feet height.
 * @param {number} z Walker world-space z coordinate.
 * @param {number} dx Movement direction x.
 * @param {number} dz Movement direction z.
 * @param {number} reach Movement distance, or zero to test overlap.
 * @param {Object} data Reusable hit record.
 */
export function collideTrip(state, trip, root, bounds, x, y, z, dx, dz, reach, data) {
  const position = state.position ||= /* alloc */ {};
  const ray = state.ray ||= /* alloc */ [0, 0, 0, 0];
  const normal = state.localNormal ||= /* alloc */ [0, 0];
  const scale = Math.max(root.scale[0], root.scale[1], root.scale[2]);
  // ponytail: oriented bounding boxes include empty corners; use vehicle geometry if that matters.
  const margin = 0.35 / scale;
  const { x: px, y: py, z: pz } = locateTraffic(state, trip, position);
  const bottom = root.position[1] + (py + bounds.minY) * root.scale[1];
  const top = root.position[1] + (position.y + bounds.maxY) * root.scale[1];
  if (bottom > y + 1.7 * scale || top < y + 0.2 * scale) return;
  trafficRay(root, position, x, z, dx, dz, px, pz, ray);
  const ox = ray[0], oz = ray[1], ux = ray[2], uz = ray[3];
  if (slabMiss(ox, ux, bounds.minX, bounds.maxX, margin) || slabMiss(oz, uz, bounds.minZ, bounds.maxZ, margin)) return;
  const nearX = slabDistance(ox, ux, bounds.minX - margin, bounds.maxX + margin, -Infinity);
  const farX = slabDistance(ox, ux, bounds.maxX + margin, bounds.minX - margin, Infinity);
  const nearZ = slabDistance(oz, uz, bounds.minZ - margin, bounds.maxZ + margin, -Infinity);
  const farZ = slabDistance(oz, uz, bounds.maxZ + margin, bounds.minZ - margin, Infinity);
  const entry = Math.max(nearX, nearZ);
  if (missesBox(entry, Math.min(farX, farZ), reach, data.best)) return;
  if (!reach) {
    data.found = true;
    return;
  }
  boxNormal(entry, nearX > nearZ, ox, oz, ux, uz, bounds, margin, normal);
  const worldX = (-normal[0] * position.dz - normal[1] * position.dx) / root.scale[0];
  const worldZ = (normal[0] * position.dx - normal[1] * position.dz) / root.scale[2];
  if (entry < 0 && dx * worldX + dz * worldZ >= 0) return;
  const length = Math.hypot(worldX, worldZ);
  data.best = Math.max(0, entry);
  data.found = true;
  data.normal[0] = worldX / length;
  data.normal[1] = worldZ / length;
}
