import { wrap } from '../utils/wrap.js';
import { place } from './placeWalker.js';
import { land } from './landWalker.js';
import { moveWalker } from './moveWalker.js';
import { updateWalkerView } from './updateWalkerView.js';

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
