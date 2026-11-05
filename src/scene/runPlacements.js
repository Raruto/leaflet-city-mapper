import { pendingPlacements } from '../globals/pendingPlacements.js';


import { placeUnderEntry } from './placeUnderEntry.js';

export function runPlacements() {
  const state = pendingPlacements.shift();
  if (state?.map.hasLayer(state.layer)) placeUnderEntry(state);
}
