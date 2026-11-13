import { pendingPlacements } from '../globals/pendingPlacements.js';
import { placeUnderEntry } from './placeUnderEntry.js';

/** Place the next queued element if its layer is still on the map. */
export function runPlacements() {
  const state = pendingPlacements.shift();
  if (state?.map.hasLayer(state.layer)) placeUnderEntry(state);
}
