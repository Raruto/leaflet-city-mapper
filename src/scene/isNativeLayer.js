import { state3dByLayer } from '../weakmaps/state3dByLayer.js';
import { L } from '../globals/L.js';

/**
 * Identify supported native Leaflet layers that are not already 3D layers.
 *
 * @param {L.Layer} layer Layer to inspect.
 *
 * @returns {boolean} Whether the layer is supported as native content.
 */
export function isNativeLayer(layer) {
  return !state3dByLayer.get(layer) && (
    layer instanceof L.GridLayer ||
    layer instanceof L.Polyline ||
    layer instanceof L.CircleMarker ||
    layer instanceof L.Marker && !(layer.options.icon instanceof L.DivIcon) ||
    layer instanceof L.ImageOverlay && !(layer instanceof L.VideoOverlay) && !(layer instanceof L.SVGOverlay)
  );
}
