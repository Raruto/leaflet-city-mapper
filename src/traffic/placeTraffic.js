import { locateTraffic } from './locateTraffic.js';

export function placeTraffic(state) {
  if (!state.mesh || !state.stale) return;
  state.stale = false;
  const { position, normal } = state.mesh.geometry.attributes;
  const target = state.position ||= /* alloc */ {};
  let i, trip, cx, y, cz, dx, dz, k, o, lx, lz, nx, nz;
  for (i = 0; i < state.trips.length; i++) {
    trip = state.trips[i];
    ({ x: cx, y, z: cz, dx, dz } = locateTraffic(state, trip, target));
    for (k = 0, o = i * state.stride; k < state.stride; k += 3, o += 3) {
      lx = state.template.position[k], lz = state.template.position[k + 2], nx = state.template.normal[k], nz = state.template.normal[k + 2];
      position.data[o] = cx - lx * dz - lz * dx;
      position.data[o + 1] = y + state.template.position[k + 1];
      position.data[o + 2] = cz + lx * dx - lz * dz;
      normal.data[o] = -nx * dz - nz * dx;
      normal.data[o + 1] = state.template.normal[k + 1];
      normal.data[o + 2] = nx * dx - nz * dz;
    }
  }
}
