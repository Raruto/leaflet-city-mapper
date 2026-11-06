export function updateNativeHover(map, context, event, source) {
  if (context.hovered === source) return;
  if (context.hovered) context.fireDOMEvent.call(map, event, context.out, /* alloc */ [context.hovered]);
  context.hovered = source;
  if (source) context.fireDOMEvent.call(map, event, context.over, /* alloc */ [source]);
  map.getContainer().style.cursor = source ? 'pointer' : '';
}
