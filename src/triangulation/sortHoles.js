import { minimumX } from './minimumX.js';

export function sortHoles(holes) {
  if (holes.length < 2) return holes;
  const buffer = /* allocation: required -- Stable merge-sort scratch belongs to this triangulation while coordinate getters may reenter it. */ new Array(holes.length);
  const entries = /* allocation: required -- Hole ordering keys belong to this triangulation independently of nested calls. */ [];
  let ring, width, start, middle, end, left, right, output, previous, i;
  for (ring of holes) entries.push(/* allocation: required -- Sorting retains each hole and its cached ordering key together. */ { ring, x: minimumX(ring) });
  let source = entries, target = buffer;
  for (width = 1; width < entries.length; width *= 2) {
    for (start = 0; start < entries.length; start += width * 2) {
      middle = Math.min(start + width, entries.length), end = Math.min(start + width * 2, entries.length);
      left = start, right = middle;
      for (output = start; output < end; output++) {
        if (left < middle && (right >= end || source[left].x <= source[right].x)) {
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
  for (i = 0; i < holes.length; i++) holes[i] = source[i].ring;
  return holes;
}
