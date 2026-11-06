import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';

export function isNativeLayer(layer) {
  return !sceneByLayer.get(layer)._3d && (
    layer instanceof L.GridLayer ||
    layer instanceof L.Polyline ||
    layer instanceof L.CircleMarker ||
    layer instanceof L.Marker && !(layer.options.icon instanceof L.DivIcon) ||
    layer instanceof L.ImageOverlay && !(layer instanceof L.VideoOverlay) && !(layer instanceof L.SVGOverlay)
  );
}
