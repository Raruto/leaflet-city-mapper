import { underEntryState } from '../constants/underEntryState.js';
import { placeUnderEntry } from './placeUnderEntry.js';
import { replaceEntry } from './replaceEntry.js';
import { removeEntry } from './removeEntry.js';

/**
 * Keeps `element` right under `layer`'s entry in the map's layers control while the layer is on the map.
 * Returns false when no layers control lists the layer.
 */
underEntryState.pendingPlacements = [];

export function underEntry(layer, element, onPlace) {
  const state = { map: layer._map, layer, element, onPlace };
  state.map.on('layeradd layerremove', replaceEntry, state);
  layer.once('remove', removeEntry, state);
  return placeUnderEntry(state);
}
