import { updateNativeHover } from './updateNativeHover.js';

export function bypassNativeEvent(map, context, event, type) {
  const target = event.target;
  const dom = target instanceof Element &&
    target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
  if (dom && context.hovered && (type === context.move || type === context.out)) {
    updateNativeHover(map, context, event, null);
  }
  return dom || type === context.move && (map.dragging?.moving() || map._animatingZoom);
}
