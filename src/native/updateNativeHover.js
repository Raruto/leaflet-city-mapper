/**
 * Dispatch hover transitions and update the cursor for the current native hit.
 *
 * @param {Object} map Leaflet map.
 * @param {Object} context Native event state.
 * @param {Event} event Original DOM event.
 * @param {Object|null} source Hit source layer, if any.
 */
export function updateNativeHover(map, context, event, source) {
  if (context.hovered === source) return;
  if (context.hovered) context.fireDOMEvent.call(map, event, context.out, /* alloc */ [context.hovered]);
  context.hovered = source;
  if (source) context.fireDOMEvent.call(map, event, context.over, /* alloc */ [source]);
  map.getContainer().style.cursor = source ? 'pointer' : '';
}
