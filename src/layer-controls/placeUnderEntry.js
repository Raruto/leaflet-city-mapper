import { placeEntry } from './placeEntry.js';

export function placeUnderEntry(state) {
  const nested = placeEntry(state.map, state.layer, state.element);
  const onPlace = state.onPlace;
  onPlace?.(nested);
  return nested;
}
