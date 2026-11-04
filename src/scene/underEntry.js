/**
 * Keeps `element` right under `layer`'s entry in the map's layers control while the layer is on the map.
 * Returns false when no layers control lists the layer.
 */
export function underEntry(layer, element, onPlace) {
  const map = layer._map;
  const place = () => {
    const nested = placeEntry(map, layer, element);
    onPlace?.(nested);
    return nested;
  };
  // Leaflet rebuilds the list after 'layeradd'/'layerremove' (on the layer's own 'add'/'remove'): re-place afterwards.
  const replace = () => queueMicrotask(() => map.hasLayer(layer) && place());
  map.on('layeradd layerremove', replace);
  layer.once('remove', () => { map.off('layeradd layerremove', replace); element.remove(); });
  return place();
}

function placeEntry(map, layer, element) {
  for (const input of map.getContainer().querySelectorAll('.leaflet-control-layers-selector')) {
    const entry = map._layers[input.layerId];
    if (input.layerId === L.Util.stamp(layer) || entry instanceof L.LayerGroup && entry.hasLayer(layer)) {
      input.closest('label').after(element);
      return true;
    }
  }
  return false;
}
