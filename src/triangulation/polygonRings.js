import { clean } from './clean.js';
import { isClockWise } from './isClockWise.js';

export function polygonRings(paths, vertices) {
  const rings = /* alloc */ [];
  let offset = 0, index, path, ring;
  for (index = 0; index < paths.length; index++) {
    path = paths[index];
    ring = clean(vertices.slice(offset, offset += path.length));
    if (isClockWise(ring) !== Boolean(index)) ring.reverse();
    rings.push(ring);
  }
  return rings;
}
