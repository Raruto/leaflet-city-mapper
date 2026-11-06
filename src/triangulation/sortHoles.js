import { minimumX } from './minimumX.js';
import { mergeHoles } from './mergeHoles.js';

export function sortHoles(holes) {
  if (holes.length < 2) return holes;
  const buffer = /* alloc */ new Array(holes.length);
  const entries = /* alloc */ [];
  let ring, width, start, previous, i;
  for (ring of holes) entries.push(/* alloc */ { ring, x: minimumX(ring) });
  let source = entries, target = buffer;
  for (width = 1; width < entries.length; width *= 2) {
    for (start = 0; start < entries.length; start += width * 2) {
      mergeHoles(source, target, start, width);
    }
    previous = source;
    source = target;
    target = previous;
  }
  for (i = 0; i < holes.length; i++) holes[i] = source[i].ring;
  return holes;
}
