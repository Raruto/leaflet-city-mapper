import { locateTraffic } from './locateTraffic.js';

/**
 * Rebuild the mesh's light snapshot by transforming each vehicle light to its current lane pose.
 *
 * @param {Object} state Traffic layer state.
 */
export function updateTrafficLights(state) {
  state.litAt = performance.now();
  const lights = /* alloc */ [];
  const target = state.position ||= /* alloc */ {};
  let trip, x, y, z, dx, dz, lx, ly, lz, light;
  for (trip of state.trips) {
    ({ x, y, z, dx, dz } = locateTraffic(state, trip, target));
    for (light of state.lights) {
      [lx, ly, lz] = light.position;
      lights.push(/* alloc */ {
        ...light, position: /* alloc */ [x - lx * dz - lz * dx, y + ly, z + lx * dx - lz * dz],
      });
    }
  }
  state.mesh.extras.lights = lights;
}
