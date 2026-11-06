import { L } from '../globals/L.js';
import { raycast } from '../picking/raycast.js';
import { compareNativeHits } from './compareNativeHits.js';

export function nativeEventSource(context, event, type) {
  const hits = /* alloc */ [];
  let candidate, source, backend;
  if (type !== context.out) {
    for (candidate of context.states) {
      ({ source, backend } = candidate);
      if (source instanceof L.Marker || source.options.interactive === false ||
        !(source instanceof L.Path) && !source.options.interactive) continue;
      hits.push(...raycast(backend, event, candidate.meshes.values(), false));
    }
  }
  hits.sort(compareNativeHits);
  return hits[0]?.object._nativeSource || null;
}
