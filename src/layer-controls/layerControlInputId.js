import { L } from '../globals/L.js';

const addItem = L.LayersControl?.prototype._addItem;

// Leaflet 2 stores layer associations on its control, not on the input.
if (addItem && !L.Control.Layers) L.LayersControl.prototype._addItem = addLayerControlInputId;

export function addLayerControlInputId(entry) {
  const label = addItem.call(this, entry);
  label.querySelector('.leaflet-control-layers-selector').layerId = L.Util.stamp(entry.layer);
  return label;
}
