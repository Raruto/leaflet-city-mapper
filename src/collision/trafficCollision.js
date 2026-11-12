import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { trafficByLayer } from '../weakmaps/trafficByLayer.js';

import { locateTraffic } from '../traffic/locateTraffic.js';

export function trafficCollision(layer, x, y, z, dx, dz, reach, data) {
  const state = trafficByLayer.get(layer);
  if (!state?.mesh || !state.trips.length) return false;
  let bounds = state.collisionBounds;
  if (!bounds) {
    bounds = state.collisionBounds = /* alloc */ {
      minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity,
    };
    let i, px, py, pz;
    for (i = 0; i < state.template.position.length; i += 3) {
      px = state.template.position[i];
      py = state.template.position[i + 1];
      pz = state.template.position[i + 2];
      bounds.minX = Math.min(bounds.minX, px);
      bounds.maxX = Math.max(bounds.maxX, px);
      bounds.minY = Math.min(bounds.minY, py);
      bounds.maxY = Math.max(bounds.maxY, py);
      bounds.minZ = Math.min(bounds.minZ, pz);
      bounds.maxZ = Math.max(bounds.maxZ, pz);
    }
  }
  const root = rootByLayer.get(layer), position = state.position ||= /* alloc */ {};
  const scale = Math.max(root.scale[0], root.scale[1], root.scale[2]);
  // ponytail: oriented bounding boxes include empty corners; use vehicle geometry if that matters.
  const margin = 0.35 / scale;
  let trip, bottom, top, px, pz, rx, rz, ox, oz, ux, uz, nearX, farX, nearZ, farZ;
  let entry, exit, nx, nz, normalLength, worldX, worldZ, nearest;
  for (trip of state.trips) {
    ({ x: px, y: bottom, z: pz } = locateTraffic(state, trip, position));
    bottom = root.position[1] + (bottom + bounds.minY) * root.scale[1];
    top = root.position[1] + (position.y + bounds.maxY) * root.scale[1];
    if (bottom > y + 1.7 * scale || top < y + 0.2 * scale) continue;
    rx = (x - root.position[0]) / root.scale[0] - px;
    rz = (z - root.position[2]) / root.scale[2] - pz;
    ox = -rx * position.dz + rz * position.dx;
    oz = -rx * position.dx - rz * position.dz;
    ux = -dx / root.scale[0] * position.dz + dz / root.scale[2] * position.dx;
    uz = -dx / root.scale[0] * position.dx - dz / root.scale[2] * position.dz;
    if ((!ux && (ox <= bounds.minX - margin || ox >= bounds.maxX + margin)) ||
      (!uz && (oz <= bounds.minZ - margin || oz >= bounds.maxZ + margin))) continue;
    nearX = ux ? ((ux > 0 ? bounds.minX - margin : bounds.maxX + margin) - ox) / ux : -Infinity;
    farX = ux ? ((ux > 0 ? bounds.maxX + margin : bounds.minX - margin) - ox) / ux : Infinity;
    nearZ = uz ? ((uz > 0 ? bounds.minZ - margin : bounds.maxZ + margin) - oz) / uz : -Infinity;
    farZ = uz ? ((uz > 0 ? bounds.maxZ + margin : bounds.minZ - margin) - oz) / uz : Infinity;
    entry = Math.max(nearX, nearZ);
    exit = Math.min(farX, farZ);
    if (entry > exit || exit < 0 || entry > reach || (reach && Math.max(0, entry) >= data.best)) continue;
    if (!reach) {
      data.found = true;
      return true;
    }
    if (entry < 0) {
      nearest = ox - (bounds.minX - margin);
      nx = -1; nz = 0;
      if (bounds.maxX + margin - ox < nearest) {
        nearest = bounds.maxX + margin - ox; nx = 1;
      }
      if (oz - (bounds.minZ - margin) < nearest) {
        nearest = oz - (bounds.minZ - margin); nx = 0; nz = -1;
      }
      if (bounds.maxZ + margin - oz < nearest) { nx = 0; nz = 1; }
    } else if (nearX > nearZ) { nx = -Math.sign(ux); nz = 0; }
    else { nx = 0; nz = -Math.sign(uz); }
    worldX = (-nx * position.dz - nz * position.dx) / root.scale[0];
    worldZ = (nx * position.dx - nz * position.dz) / root.scale[2];
    normalLength = Math.hypot(worldX, worldZ);
    if (entry < 0 && dx * worldX + dz * worldZ >= 0) continue;
    entry = Math.max(0, entry);
    data.best = entry;
    data.found = true;
    data.normal[0] = worldX / normalLength;
    data.normal[1] = worldZ / normalLength;
  }
  return data.found;
}
