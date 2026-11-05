import { state as sharedState } from '../state.js';

import { runPlacements } from './runPlacements.js';

export function replaceEntry() {
  sharedState.pendingPlacements.push(this);
  queueMicrotask(runPlacements);
}
