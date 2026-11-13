import { placeEntry } from './placeEntry.js';

/**
 * Place a tracked element under its layer entry and notify its placement callback.
 *
 * @param {Object} state Placement state.
 *
 * @returns {boolean} Whether a matching entry was found.
 */
export function placeUnderEntry(state) {
  const nested = placeEntry(state.map, state.layer, state.element);
  const onPlace = state.onPlace;
  onPlace?.(nested);
  return nested;
}
