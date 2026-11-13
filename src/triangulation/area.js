/**
 * Calculate the unsigned area enclosed by a planar ring.
 *
 * @param {Object[]} ring Points with x and y coordinates.
 *
 * @returns {number} Absolute ring area.
 */
export function area(ring) {
  let sum = 0;
  let i, p, q;
  for (i = 0; i < ring.length; i++) {
    p = ring[i], q = ring[(i + 1) % ring.length];
    sum += p.x * q.y - q.x * p.y;
  }
  return Math.abs(sum) / 2;
}
