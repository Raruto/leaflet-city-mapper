import { nativeEventMaps } from './constants/nativeEventMaps.js';
import { cityMapper } from '../constants/cityMapper.js';
import { raycast } from './raycast.js';
import { compareNativeHits } from './compareNativeHits.js';

export function handleNativeMapEvent(event, type = event.type, targets) {
  const map = this, context = nativeEventMaps.get(map), fireDOMEvent = context.fireDOMEvent;
  const owner = cityMapper.renderers.get(map);
  if (!owner?.renderer || targets || !['click', 'preclick', 'dblclick', 'contextmenu',
    'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
    'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout'].includes(type)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  const target = event.target;
  const dom = target instanceof Element &&
    target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
  if (dom && context.hovered && (type === context.move || type === context.out)) {
    fireDOMEvent.call(map, event, context.out, [context.hovered]);
    context.hovered = null;
    map.getContainer().style.cursor = '';
  }
  if (dom || type === context.move && (map.dragging?.moving() || map._animatingZoom)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  const hits = [];
  if (type !== context.out) {
    for (const candidate of context.states) {
      const { source, backend } = candidate;
      if (source instanceof L.Marker || source.options.interactive === false ||
        !(source instanceof L.Path) && !source.options.interactive) continue;
      hits.push(...raycast(backend, event, candidate.meshes.values(), false));
    }
  }
  hits.sort(compareNativeHits);
  let source = hits[0]?.object._nativeSource || null;
  if ((type === 'click' || type === 'preclick') && source && map._draggableMoved(source)) source = null;
  if (type === context.move || type === context.out) {
    if (context.hovered !== source) {
      if (context.hovered) fireDOMEvent.call(map, event, context.out, [context.hovered]);
      context.hovered = source;
      if (source) fireDOMEvent.call(map, event, context.over, [source]);
      map.getContainer().style.cursor = source ? 'pointer' : '';
    }
  }
  return fireDOMEvent.call(this, event, type, source ? [source] : undefined);
}
