export function sortHits(hits) {
  const buffer = new Array(hits.length);
  let source = hits, target = buffer;
  for (let width = 1; width < hits.length; width *= 2) {
    for (let start = 0; start < hits.length; start += width * 2) {
      const middle = Math.min(start + width, hits.length), end = Math.min(start + width * 2, hits.length);
      let left = start, right = middle;
      for (let output = start; output < end; output++) {
        if (left < middle && (right >= end || !(source[right].distance < source[left].distance))) {
          target[output] = source[left++];
        } else {
          target[output] = source[right++];
        }
      }
    }
    const previous = source;
    source = target;
    target = previous;
  }
  if (source !== hits) for (let i = 0; i < hits.length; i++) hits[i] = source[i];
  return hits;
}
