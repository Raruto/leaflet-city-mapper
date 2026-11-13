import { L } from '../globals/L.js';
import { raycast } from '../picking/raycast.js';
import { compareNativeHits } from './compareNativeHits.js';

/**
 * Find the foremost interactive native path hit by a map event.
 *
 * @param {Object} context Native event state for the map.
 * @param {Event} event Original DOM event.
 * @param {string} type Event type being dispatched.
 *
 * @returns {Object|null} Hit source layer, or null.
 */
export function nativeEventSource(context, event, type) {
  const hits = /* alloc */ [];
  let candidate, source, layer;
  if (type !== context.out) {
    for (candidate of context.states) {
      ({ source, backend: layer } = candidate);
      if (source instanceof L.Marker || source.options.interactive === false ||
        !(source instanceof L.Path) && !source.options.interactive) continue;
      hits.push(...raycast(layer, event, candidate.meshes.values(), false));
    }
  }
  hits.sort(compareNativeHits);
  return hits[0]?.object._nativeSource || null;
}
