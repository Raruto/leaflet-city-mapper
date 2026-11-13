import { clean } from './clean.js';
import { isClockWise } from './isClockWise.js';

/**
 * Split indexed vertices into cleaned rings and normalize outer and hole winding.
 *
 * @param {Object[][]} paths Original polygon paths defining ring lengths.
 * @param {Object[]} vertices Indexed vertices corresponding to the paths.
 *
 * @returns {Object[][]} Cleaned rings with normalized winding.
 */
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
