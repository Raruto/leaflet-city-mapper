import { L } from '../globals/L.js';
import { nativeEventMaps } from '../globals/nativeEventMaps.js';
import { renderers } from '../globals/renderers.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { coreEventTypes } from '../globals/coreEventTypes.js';



import { raycast } from '../picking/raycast.js';
import { compareNativeHits } from './compareNativeHits.js';

export function handleNativeMapEvent(event, type = event.type, targets) {
  const map = this, context = nativeEventMaps.get(map), fireDOMEvent = context.fireDOMEvent;
  const owner = renderers.get(map);
  if (!sceneByLayer.get(owner)?.renderer || targets || !coreEventTypes.has(type)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  const target = event.target;
  const dom = target instanceof Element &&
    target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
  if (dom && context.hovered && (type === context.move || type === context.out)) {
    fireDOMEvent.call(map, event, context.out, /* alloc */ [context.hovered]);
    context.hovered = null;
    map.getContainer().style.cursor = '';
  }
  if (dom || type === context.move && (map.dragging?.moving() || map._animatingZoom)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  const hits = /* alloc */ [];
  let candidate, source2, backend;
  if (type !== context.out) {
    for (candidate of context.states) {
      ({ source: source2, backend } = candidate);
      if (source2 instanceof L.Marker || source2.options.interactive === false ||
        !(source2 instanceof L.Path) && !source2.options.interactive) continue;
      hits.push(...raycast(backend, event, candidate.meshes.values(), false));
    }
  }
  hits.sort(compareNativeHits);
  let source = hits[0]?.object._nativeSource || null;
  if ((type === 'click' || type === 'preclick') && source && map._draggableMoved(source)) source = null;
  if (type === context.move || type === context.out) {
    if (context.hovered !== source) {
      if (context.hovered) fireDOMEvent.call(map, event, context.out, /* alloc */ [context.hovered]);
      context.hovered = source;
      if (source) fireDOMEvent.call(map, event, context.over, /* alloc */ [source]);
      map.getContainer().style.cursor = source ? 'pointer' : '';
    }
  }
  return fireDOMEvent.call(this, event, type, source ? /* alloc */ [source] : undefined);
}
