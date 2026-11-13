
import { placeUnderEntry } from './placeUnderEntry.js';
import { replaceEntry } from './replaceEntry.js';
import { removeEntry } from './removeEntry.js';

/**
 * Keeps `element` right under `layer`'s entry in the map's layers control while the layer is on the map.
 *
 * @param {L.Layer} layer Layer whose entry should contain the element.
 * @param {HTMLElement} element Element to place.
 * @param {Function} [onPlace] Callback receiving whether placement succeeded.
 *
 * @returns {boolean} False when no layers control lists the layer.
 */
export function underEntry(layer, element, onPlace) {
  const state = /* alloc */ { map: layer._map, layer, element, onPlace };
  state.map.on('layeradd layerremove', replaceEntry, state);
  layer.once('remove', removeEntry, state);
  return placeUnderEntry(state);
}
