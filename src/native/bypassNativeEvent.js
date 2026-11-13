import { updateNativeHover } from './updateNativeHover.js';

/**
 * Decide whether a DOM event should bypass native layer hit testing.
 *
 * @param {Object} map Leaflet map.
 * @param {Object} context Native event state for the map.
 * @param {Event} event Original DOM event.
 * @param {string} type Event type being dispatched.
 *
 * @returns {Element|boolean|null} The matching DOM target or whether testing should be bypassed.
 */
export function bypassNativeEvent(map, context, event, type) {
  const target = event.target;
  const dom = target instanceof Element &&
    target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
  if (dom && context.hovered && (type === context.move || type === context.out)) {
    updateNativeHover(map, context, event, null);
  }
  return dom || type === context.move && (map.dragging?.moving() || map._animatingZoom);
}
