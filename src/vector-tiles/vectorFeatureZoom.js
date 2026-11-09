import { visibleStyle } from '../vector-style/visibleStyle.js';

export function vectorFeatureZoom(entry, properties, zoom, maxZoom) {
  if (visibleStyle(entry, properties, zoom)) return zoom;
  zoom = maxZoom;
  while (zoom >= 0 && !visibleStyle(entry, properties, zoom)) zoom--;
  return zoom;
}
