import { raycast } from './raycast.js';

const maps = new WeakMap();

/** One GPU hit test per map event, rather than one invisible SVG path per feature. */
export function nativeEvents(state) {
  const { map } = state;
  let context = maps.get(map);
  if (!context) {
    context = { states: new Set(), hovered: null };
    const pointer = L.version.startsWith('2');
    const move = pointer ? 'pointermove' : 'mousemove', out = pointer ? 'pointerout' : 'mouseout';
    const over = pointer ? 'pointerover' : 'mouseover';
    const descriptor = Object.getOwnPropertyDescriptor(map, '_fireDOMEvent');
    const fireDOMEvent = map._fireDOMEvent;
    const handle = function (event, type = event.type, targets) {
      const owner = L.Layer._renderers.get(map);
      if (!owner?.renderer || targets || !['click', 'preclick', 'dblclick', 'contextmenu',
        'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
        'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout'].includes(type)) {
        return fireDOMEvent.call(this, event, type, targets);
      }
      const target = event.target;
      const dom = target instanceof Element &&
        target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
      if (dom && context.hovered && (type === move || type === out)) {
        fireDOMEvent.call(map, event, out, [context.hovered]);
        context.hovered = null;
        map.getContainer().style.cursor = '';
      }
      if (dom || type === move && (map.dragging?.moving() || map._animatingZoom)) {
        return fireDOMEvent.call(this, event, type, targets);
      }
      const hits = [];
      if (type !== out) {
        for (const candidate of context.states) {
          const { source, backend } = candidate;
          if (source instanceof L.Marker || source.options.interactive === false ||
            !(source instanceof L.Path) && !source.options.interactive) continue;
          hits.push(...raycast(backend, event, candidate.meshes.values(), false));
        }
      }
      hits.sort((a, b) => b.object.renderOrder - a.object.renderOrder || a.distance - b.distance);
      let source = hits[0]?.object._nativeSource || null;
      if ((type === 'click' || type === 'preclick') && source && map._draggableMoved(source)) source = null;
      if (type === move || type === out) {
        if (context.hovered !== source) {
          if (context.hovered) fireDOMEvent.call(map, event, out, [context.hovered]);
          context.hovered = source;
          if (source) fireDOMEvent.call(map, event, over, [source]);
          map.getContainer().style.cursor = source ? 'pointer' : '';
        }
      }
      return fireDOMEvent.call(this, event, type, source ? [source] : undefined);
    };
    context.handle = handle;
    context.restore = () => {
      if (map._fireDOMEvent !== handle) return;
      if (descriptor) Object.defineProperty(map, '_fireDOMEvent', descriptor);
      else delete map._fireDOMEvent;
    };
    maps.set(map, context);
    map._fireDOMEvent = handle;
  }
  context.states.add(state);
  return () => {
    context.states.delete(state);
    if (context.hovered === state.source) {
      context.hovered = null;
      map.getContainer().style.cursor = '';
    }
    if (context.states.size) return;
    context.restore();
    maps.delete(map);
  };
}
