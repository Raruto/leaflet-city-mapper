import { moveTraffic } from './moveTraffic.js';
import { updateTrafficLights } from './updateTrafficLights.js';

/**
 * Update GPU vehicle poses and refresh light positions, throttling live light updates.
 *
 * @param {Object} state Traffic layer state.
 * @param {number} ms Simulation timestamp in milliseconds.
 * @param {boolean} live Whether the simulation clock is live.
 */
export function updateTrafficPose(state, ms, live) {
  if (!state.mesh) return;
  moveTraffic(state, (ms - state.rebasedAt) / 1000);
  if (state.lights && (!live || !(performance.now() - state.litAt < 100))) updateTrafficLights(state);
}
