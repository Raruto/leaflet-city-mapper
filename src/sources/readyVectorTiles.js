import { kindByLayer } from '../weakmaps/kindByLayer.js';

export function readyVectorTiles(layer) {
  const map = layer._map;
  map?.removeLayer(layer);
  kindByLayer.delete(layer);
  map?.addLayer(layer);
  layer.fire('ready');
  return layer;
}
