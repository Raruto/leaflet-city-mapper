import { wrap } from '../utils/wrap.js';
import { place } from './placeWalker.js';
import { land } from './landWalker.js';
import { moveWalker } from './moveWalker.js';
import { updateWalkerView } from './updateWalkerView.js';

/**
 * Apply heading, motion, landing and camera changes, repositioning meshes when the frame changes.
 *
 * @param {Object} walker Walk context.
 * @param {number} previousY Previous world-space feet height.
 * @param {number} forward Signed movement direction.
 * @param {number} turn Signed turning direction.
 * @param {number} dt Frame duration in seconds.
 * @param {boolean} changed Whether the walker already changed this frame.
 */
export function updateWalkerFrame(walker, previousY, forward, turn, dt, changed) {
  if (turn) {
    walker.state.heading = wrap(walker.state.heading + turn * 2.5 * dt);
    changed = true;
  }
  if (forward) {
    moveWalker.call(walker, forward, dt);
    changed = true;
  }
  if (changed) land.call(walker, previousY);
  if (updateWalkerView.call(walker, forward, turn, dt)) changed = true;
  if (changed) place.call(walker);
}
