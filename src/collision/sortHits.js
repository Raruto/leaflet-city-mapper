import { mergeHits } from './mergeHits.js';

/**
 * Sort hits in place by ascending distance using a stable merge sort.
 *
 * @param {Object[]} hits Hits with distance properties.
 *
 * @returns {Object[]} The supplied array, sorted in place.
 */
export function sortHits(hits) {
  if (hits.length < 2) return hits;
  const buffer = /* alloc */ new Array(hits.length);
  let source = hits, target = buffer;
  let width, start, previous, i;
  for (width = 1; width < hits.length; width *= 2) {
    for (start = 0; start < hits.length; start += width * 2) {
      mergeHits(source, target, start, width);
    }
    previous = source;
    source = target;
    target = previous;
  }
  if (source !== hits) for (i = 0; i < hits.length; i++) hits[i] = source[i];
  return hits;
}
