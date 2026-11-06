import { rendererByLayer } from '../weakmaps/rendererByLayer.js';



import { update as updateScene } from '../scene/scheduleSceneUpdate.js';
import { trafficNow } from './trafficNow.js';
import { refreshTrafficTrips } from './refreshTrafficTrips.js';
import { updateTrafficPose } from './updateTrafficPose.js';

export function tickTraffic(state) {
  state.frame = undefined;
  if (!state.ready || !state.layer._map) return;
  if (!rendererByLayer.get(state.layer)) { state.frame = requestAnimationFrame(state.tick); return; }
  if (state.mesh && !(state.mesh.geometry.attributes.position.buffer.usage & GPUBufferUsage.STORAGE)) {
    state.tripsKey = null;
    state.nextCheck = -Infinity;
  }
  const { live, time } = trafficNow(state), ms = time?.getTime(), valid = Number.isFinite(ms);
  let changed = false;
  if (!live || !valid || !(ms >= state.rebasedAt && ms < state.nextCheck)) {
    changed = refreshTrafficTrips(state, time, ms, valid);
    if (changed === undefined) return;
  }
  updateTrafficPose(state, ms, live);
  if (state.mesh || changed) updateScene(state.layer);
  if (live && valid) state.frame = requestAnimationFrame(state.tick);
}
