import { underEntryState } from '../constants/underEntryState.js';
import { runPlacements } from './runPlacements.js';

export function replaceEntry() {
  underEntryState.pendingPlacements.push(this);
  queueMicrotask(runPlacements);
}
