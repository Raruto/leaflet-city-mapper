import { minimumX } from './minimumX.js';

export function sortHoles(holes) {
  const buffer = new Array(holes.length), entries = [];
  for (const ring of holes) entries.push({ ring, x: minimumX(ring) });
  let source = entries, target = buffer;
  for (let width = 1; width < entries.length; width *= 2) {
    for (let start = 0; start < entries.length; start += width * 2) {
      const middle = Math.min(start + width, entries.length), end = Math.min(start + width * 2, entries.length);
      let left = start, right = middle;
      for (let output = start; output < end; output++) {
        if (left < middle && (right >= end || source[left].x <= source[right].x)) {
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
  for (let i = 0; i < holes.length; i++) holes[i] = source[i].ring;
  return holes;
}
