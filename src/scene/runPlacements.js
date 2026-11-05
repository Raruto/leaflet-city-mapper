import { state as sharedState } from '../state.js';

import { placeUnderEntry } from './placeUnderEntry.js';

export function runPlacements() {
  const state = sharedState.pendingPlacements.shift();
  if (state?.map.hasLayer(state.layer)) placeUnderEntry(state);
}
