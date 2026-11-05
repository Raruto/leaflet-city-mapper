import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';

import { raycast } from '../picking/raycast.js';
import { compareNativeHits } from './compareNativeHits.js';

export function handleNativeMapEvent(event, type = event.type, targets) {
  const map = this, context = sharedState.nativeEventMaps.get(map), fireDOMEvent = context.fireDOMEvent;
  const owner = sharedState.renderers.get(map);
  if (!pluginState(owner)?.renderer || targets || !sharedState.allocationCoreEventTypes.has(type)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  const target = event.target;
  const dom = target instanceof Element &&
    target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
  if (dom && context.hovered && (type === context.move || type === context.out)) {
    fireDOMEvent.call(map, event, context.out, /* allocation: required -- Native event dispatch can reenter and mutate hovered targets. */ [context.hovered]);
    context.hovered = null;
    map.getContainer().style.cursor = '';
  }
  if (dom || type === context.move && (map.dragging?.moving() || map._animatingZoom)) {
    return fireDOMEvent.call(this, event, type, targets);
  }
  const hits = /* allocation: required -- Raycasts and DOM listeners may reenter; each dispatch owns its hit ordering. */ [];
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
      if (context.hovered) fireDOMEvent.call(map, event, context.out, /* allocation: required -- Nested mouseout dispatch must not overwrite this target list. */ [context.hovered]);
      context.hovered = source;
      if (source) fireDOMEvent.call(map, event, context.over, /* allocation: required -- Nested mouseover dispatch must not overwrite this target list. */ [source]);
      map.getContainer().style.cursor = source ? 'pointer' : '';
    }
  }
  return fireDOMEvent.call(this, event, type, source ? /* allocation: required -- Each native dispatch owns its target list across listener callbacks. */ [source] : undefined);
}
