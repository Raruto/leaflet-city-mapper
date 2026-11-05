export function sortHits(hits) {
  if (hits.length < 2) return hits;
  const buffer = /* allocation: required -- Stable merge-sort scratch belongs to this picking result while distance getters may reenter sorting. */ new Array(hits.length);
  let source = hits, target = buffer;
  let width, start, middle, end, left, right, output, previous, i;
  for (width = 1; width < hits.length; width *= 2) {
    for (start = 0; start < hits.length; start += width * 2) {
      middle = Math.min(start + width, hits.length), end = Math.min(start + width * 2, hits.length);
      left = start, right = middle;
      for (output = start; output < end; output++) {
        if (left < middle && (right >= end || !(source[right].distance < source[left].distance))) {
          target[output] = source[left++];
        } else {
          target[output] = source[right++];
        }
      }
    }
    previous = source;
    source = target;
    target = previous;
  }
  if (source !== hits) for (i = 0; i < hits.length; i++) hits[i] = source[i];
  return hits;
}
