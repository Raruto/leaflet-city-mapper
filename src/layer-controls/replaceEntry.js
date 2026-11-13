import { pendingPlacements } from '../globals/pendingPlacements.js';
import { runPlacements } from './runPlacements.js';

/** Queue this tracked layer-control element for placement in a microtask. */
export function replaceEntry() {
  pendingPlacements.push(this);
  queueMicrotask(runPlacements);
}
