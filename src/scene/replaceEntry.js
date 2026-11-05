import { pendingPlacements } from '../globals/pendingPlacements.js';


import { runPlacements } from './runPlacements.js';

export function replaceEntry() {
  pendingPlacements.push(this);
  queueMicrotask(runPlacements);
}
