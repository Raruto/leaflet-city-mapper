import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { trafficByLayer } from '../weakmaps/trafficByLayer.js';

import { locateTraffic } from '../traffic/locateTraffic.js';

export function trafficCollision(layer, x, y, z, dx, dz, reach, data) {
  const state = trafficByLayer.get(layer);
  if (!state?.mesh || !state.trips.length) return false;
  let bounds = state.collisionBounds;
  if (!bounds) {
    bounds = state.collisionBounds = { radius: 0, minY: Infinity, maxY: -Infinity };
    let i, px, py, pz;
    for (i = 0; i < state.template.position.length; i += 3) {
      px = state.template.position[i];
      py = state.template.position[i + 1];
      pz = state.template.position[i + 2];
      bounds.radius = Math.max(bounds.radius, Math.hypot(px, pz));
      bounds.minY = Math.min(bounds.minY, py);
      bounds.maxY = Math.max(bounds.maxY, py);
    }
  }
  const root = rootByLayer.get(layer), position = state.position ||= {};
  const scale = Math.max(root.scale[0], root.scale[1], root.scale[2]);
  const radius = bounds.radius * scale + 0.35;
  let trip, projection, closest, rx, rz, perpendicular, entry, distance, bottom, top, px, pz;
  for (trip of state.trips) {
    ({ x: px, y: bottom, z: pz } = locateTraffic(state, trip, position));
    bottom = root.position[1] + (bottom + bounds.minY) * root.scale[1];
    top = root.position[1] + (position.y + bounds.maxY) * root.scale[1];
    if (bottom > y + 1.7 * scale || top < y + 0.2 * scale) continue;
    px = root.position[0] + px * root.scale[0];
    pz = root.position[2] + pz * root.scale[2];
    projection = (px - x) * dx + (pz - z) * dz;
    closest = Math.max(0, Math.min(reach, projection));
    rx = x + closest * dx - px;
    rz = z + closest * dz - pz;
    perpendicular = rx * rx + rz * rz;
    if (perpendicular >= radius * radius) continue;
    if (reach === 0) {
      data.found = true;
      distance = Math.hypot(x - px, z - pz);
      data.normal[0] = distance ? (x - px) / distance : 0;
      data.normal[1] = distance ? (z - pz) / distance : 0;
      continue;
    }
    entry = Math.max(0, projection - Math.sqrt(radius * radius - perpendicular));
    if (entry > reach || entry >= data.best) continue;
    data.best = entry;
    data.found = true;
    distance = Math.hypot(x + entry * dx - px, z + entry * dz - pz);
    if (distance < 1e-6) {
      data.normal[0] = -dx;
      data.normal[1] = -dz;
    } else {
      data.normal[0] = (x + entry * dx - px) / distance;
      data.normal[1] = (z + entry * dz - pz) / distance;
    }
  }
  return data.found;
}
