import { locateTraffic } from './locateTraffic.js';

export function updateTrafficLights(state) {
  state.litAt = performance.now();
  const lights = /* alloc */ [];
  let trip, x, y, z, dx, dz, lx, ly, lz, light;
  for (trip of state.trips) {
    ({ x, y, z, dx, dz } = locateTraffic(state, trip));
    for ({ position: [lx, ly, lz], ...light } of state.lights) {
      lights.push(/* alloc */ {
        ...light, position: /* alloc */ [x - lx * dz - lz * dx, y + ly, z + lx * dx - lz * dz],
      });
    }
  }
  state.mesh.extras.lights = lights;
}
