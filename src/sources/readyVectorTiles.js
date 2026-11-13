import { kindByLayer } from '../weakmaps/kindByLayer.js';

/**
 * Reattach a configured vector tile layer and emit its ready event.
 *
 * @param {L.Layer} layer Configured layer.
 *
 * @returns {L.Layer} The layer.
 */
export function readyVectorTiles(layer) {
  const map = layer._map;
  map?.removeLayer(layer);
  kindByLayer.delete(layer);
  map?.addLayer(layer);
  layer.fire('ready');
  return layer;
}
