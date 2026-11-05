export function placeEntry(map, layer, element) {
  for (const input of map.getContainer().querySelectorAll('.leaflet-control-layers-selector')) {
    const entry = map._layers[input.layerId];
    if (input.layerId === L.Util.stamp(layer) || entry instanceof L.LayerGroup && entry.hasLayer(layer)) {
      input.closest('label').after(element);
      return true;
    }
  }
  return false;
}
