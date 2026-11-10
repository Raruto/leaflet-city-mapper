import { L } from '../globals/L.js';
import { placeEntryElement } from './placeEntryElement.js';
import './layerControlInputId.js';

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
