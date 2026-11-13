import { L } from '../globals/L.js';
import { placeEntryElement } from './placeEntryElement.js';
import './layerControlInputId.js';

/**
 * Find a layers-control entry containing the layer and place an element beside it.
 *
 * @param {L.Map} map Map containing the layers control.
 * @param {L.Layer} layer Layer to locate.
 * @param {HTMLElement} element Element to place.
 *
 * @returns {boolean} Whether a matching entry was found.
 */
export function placeEntry(map, layer, element) {
  let input, entry;
  for (input of map.getContainer().querySelectorAll('.leaflet-control-layers-selector')) {
    entry = map._layers[input.layerId];
    if (input.layerId === L.Util.stamp(layer) || entry instanceof L.LayerGroup && entry.hasLayer(layer)) {
      placeEntryElement(input, layer, element);
      return true;
    }
  }
  return false;
}
