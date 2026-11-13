/**
 * Check whether a point lies within a segment's axis-aligned bounding box.
 *
 * @param {Object} p First segment endpoint.
 * @param {Object} q Second segment endpoint.
 * @param {Object} r Point to test.
 *
 * @returns {boolean} Whether the point lies within the bounds.
 */
export function on(p, q, r) {
  return Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) &&
    Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
}
