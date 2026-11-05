import { state as sharedState } from '../state.js';

import { placeUnderEntry } from './placeUnderEntry.js';
import { replaceEntry } from './replaceEntry.js';
import { removeEntry } from './removeEntry.js';

/**
 * Keeps `element` right under `layer`'s entry in the map's layers control while the layer is on the map.
 * Returns false when no layers control lists the layer.
 */

export function underEntry(layer, element, onPlace) {
  const state = /* allocation: required -- Keep placement callbacks independent per entry. */ { map: layer._map, layer, element, onPlace };
  state.map.on('layeradd layerremove', replaceEntry, state);
  layer.once('remove', removeEntry, state);
  return placeUnderEntry(state);
}
