import { sceneByLayer } from '../globals/sceneByLayer.js';


import { update as updateScene } from '../scene/update.js';
import { tripsAt } from './tripsAt.js';
import { trafficNow } from './trafficNow.js';
import { failTraffic } from './failTraffic.js';
import { drawTrafficRoute } from './drawTrafficRoute.js';
import { rebuildTrafficMesh } from './rebuildTrafficMesh.js';
import { rebaseTraffic } from './rebaseTraffic.js';
import { moveTraffic } from './moveTraffic.js';
import { locateTraffic } from './locateTraffic.js';

export function tickTraffic(state) {
  state.frame = undefined;
  if (!state.ready || !state.layer._map) return;
  if (!sceneByLayer.get(state.layer).renderer) { state.frame = requestAnimationFrame(state.tick); return; }
  if (state.mesh && !(state.mesh.geometry.attributes.position.buffer.usage & GPUBufferUsage.STORAGE)) {
    state.tripsKey = null;
    state.nextCheck = -Infinity;
  }
  const { live, time } = trafficNow(state), ms = time?.getTime(), valid = Number.isFinite(ms);
  let changed = false;
  let trip, x, y, z, dx, dz, lx, ly, lz, light;
  if (!live || !valid || !(ms >= state.rebasedAt && ms < state.nextCheck)) {
    let text;
    try {
      if (valid) state.trips = tripsAt(time, state.lanes, state.velocity);
      else state.trips.length = 0;
      text = !valid ? `${state.vehicle}: select a valid simulation date` : !state.loaded ? `${state.vehicle}: loading…` :
        `${state.trips.length} ${state.vehicle === 'boat' ? 'boats' : state.vehicle}`;
    } catch (error) { return failTraffic(state, error); }
    state.rebasedAt = ms;
    state.nextCheck = ms + 1000;
    let key = '';
    for (trip of state.trips) key += `${key ? ',' : ''}${trip.id}`;
    changed = key !== state.tripsKey || (state.outline && !state.route && state.lanes.length);
    if (state.outline && !state.route && state.lanes.length) drawTrafficRoute(state);
    if (key !== state.tripsKey) { rebuildTrafficMesh(state); state.tripsKey = key; }
    if (state.mesh) rebaseTraffic(state);
    if (!state.error) {
      if (state.status.textContent !== text) state.status.textContent = text;
      state.status.removeAttribute('role');
    }
  }
  if (state.mesh) moveTraffic(state, (ms - state.rebasedAt) / 1000);
  if (state.mesh && state.lights && (!live || !(performance.now() - state.litAt < 100))) {
    state.litAt = performance.now();
    const lights = /* alloc */ [];
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
  if (state.mesh || changed) updateScene(state.layer);
  if (live && valid) state.frame = requestAnimationFrame(state.tick);
}
