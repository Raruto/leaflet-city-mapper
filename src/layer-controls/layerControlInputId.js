import { L } from '../globals/L.js';
import { layerControlAddItem } from '../globals/layerControlAddItem.js';

// Leaflet 2 stores layer associations on its control, not on the input.
if (layerControlAddItem && !L.Control.Layers) L.LayersControl.prototype._addItem = addLayerControlInputId;

export function addLayerControlInputId(entry) {
  const label = layerControlAddItem.call(this, entry);
  label.querySelector('.leaflet-control-layers-selector').layerId = L.Util.stamp(entry.layer);
  return label;
}
