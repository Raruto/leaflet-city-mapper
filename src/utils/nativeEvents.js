import { raycast } from './raycast.js';

const maps = new WeakMap();

/** One GPU hit test per map event, rather than one invisible SVG path per feature. */
export function nativeEvents(state) {
  const { map } = state;
  let context = maps.get(map);
  if (!context) {
    context = { states: new Set(), hovered: null };
    const handle = event => {
      const owner = L.Layer._renderers.get(map);
      if (!owner?.renderer || !event.originalEvent) return;
      const target = event.originalEvent.target;
      const dom = target instanceof Element &&
        target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control');
      const meshes = [];
      if (!dom && event.type !== 'mouseout') {
        for (const candidate of context.states) {
          const { source } = candidate;
          if (source instanceof L.Marker || source.options.interactive === false ||
            !(source instanceof L.Path) && !source.options.interactive) continue;
          meshes.push(...candidate.meshes.values());
        }
      }
      const hits = meshes.length ? raycast(owner, event.originalEvent, meshes, false) : [];
      hits.sort((a, b) => b.object.renderOrder - a.object.renderOrder || a.distance - b.distance);
      const source = hits[0]?.object._nativeSource || null;
      const data = {
        originalEvent: event.originalEvent, latlng: event.latlng,
        layerPoint: event.layerPoint, containerPoint: event.containerPoint,
      };
      if (event.type === 'mousemove' || event.type === 'mouseout') {
        if (context.hovered !== source) {
          context.hovered?.fire('mouseout', data, true);
          context.hovered = source;
          source?.fire('mouseover', data, true);
          map.getContainer().style.cursor = source ? 'pointer' : '';
        }
      }
      if (event.type !== 'mouseout') source?.fire(event.type, data, true);
    };
    context.handle = handle;
    maps.set(map, context);
    map.on('click dblclick contextmenu mousemove mouseout', handle);
  }
  context.states.add(state);
  return () => {
    context.states.delete(state);
    if (context.hovered === state.source) {
      context.hovered = null;
      map.getContainer().style.cursor = '';
    }
    if (context.states.size) return;
    map.off('click dblclick contextmenu mousemove mouseout', context.handle);
    maps.delete(map);
  };
}
