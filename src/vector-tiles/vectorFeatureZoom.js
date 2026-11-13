import { visibleStyle } from '../vector-style/visibleStyle.js';

/**
 * Find a zoom at which the style is visible for a feature.
 *
 * @param {Object} entry Style layer entry.
 * @param {Object} properties Feature properties.
 * @param {number} zoom Current style zoom.
 * @param {number} maxZoom Maximum fallback zoom.
 *
 * @returns {number} Visible zoom, or -1 if none is found.
 */
export function vectorFeatureZoom(entry, properties, zoom, maxZoom) {
  if (visibleStyle(entry, properties, zoom)) return zoom;
  zoom = maxZoom;
  while (zoom >= 0 && !visibleStyle(entry, properties, zoom)) zoom--;
  return zoom;
}
