/**
 * Compute the signed 2D cross product of the vectors from a to b and c.
 *
 * @param {Object} a Origin point with x and y coordinates.
 * @param {Object} b First endpoint.
 * @param {Object} c Second endpoint.
 *
 * @returns {number} Signed cross product.
 */
export function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
