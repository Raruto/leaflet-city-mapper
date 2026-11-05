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
  if (!state.layer.renderer) { state.frame = requestAnimationFrame(state.tick); return; }
  if (state.mesh && !(state.mesh.geometry.attributes.position.buffer.usage & GPUBufferUsage.STORAGE)) {
    state.tripsKey = null;
    state.nextCheck = -Infinity;
  }
  const { live, time } = trafficNow(state), ms = time?.getTime(), valid = Number.isFinite(ms);
  let changed = false;
  if (!live || !valid || !(ms >= state.rebasedAt && ms < state.nextCheck)) {
    let text;
    try {
      state.trips = valid ? tripsAt(time, state.lanes, state.velocity) : [];
      text = !valid ? 'Select a valid simulation date' : !state.loaded ? 'Loading…' :
        `${state.trips.length} ${state.vehicle === 'boat' ? 'boats' : state.vehicle}`;
    } catch (error) { return failTraffic(state, error); }
    state.rebasedAt = ms;
    state.nextCheck = ms + 1000;
    const ids = [];
    for (const trip of state.trips) ids.push(trip.id);
    const key = ids.join();
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
    const lights = [];
    for (const trip of state.trips) {
      const { x, y, z, dx, dz } = locateTraffic(state, trip);
      for (const { position: [lx, ly, lz], ...light } of state.lights) {
        lights.push({ ...light, position: [x - lx * dz - lz * dx, y + ly, z + lx * dx - lz * dz] });
      }
    }
    state.mesh.extras.lights = lights;
  }
  if (state.mesh || changed) updateScene(state.layer);
  if (live && valid) state.frame = requestAnimationFrame(state.tick);
}
