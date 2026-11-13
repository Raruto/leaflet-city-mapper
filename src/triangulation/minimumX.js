/**
 * Find the smallest x coordinate in a ring.
 *
 * @param {Object[]} ring Points with x coordinates.
 *
 * @returns {number} Minimum x, or Infinity for an empty ring.
 */
export function minimumX(ring) {
  let minimum = Infinity;
  let point;
  for (point of ring) minimum = Math.min(minimum, point.x);
  return minimum;
}
