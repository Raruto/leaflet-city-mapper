import { underEntryState } from '../constants/underEntryState.js';
import { placeUnderEntry } from './placeUnderEntry.js';

export function runPlacements() {
  const state = underEntryState.pendingPlacements.shift();
  if (state?.map.hasLayer(state.layer)) placeUnderEntry(state);
}
