import { moveTraffic } from './moveTraffic.js';
import { updateTrafficLights } from './updateTrafficLights.js';

export function updateTrafficPose(state, ms, live) {
  if (!state.mesh) return;
  moveTraffic(state, (ms - state.rebasedAt) / 1000);
  if (state.lights && (!live || !(performance.now() - state.litAt < 100))) updateTrafficLights(state);
}
