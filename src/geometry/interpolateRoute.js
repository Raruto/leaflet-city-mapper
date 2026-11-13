/**
 * Compute point and unit direction at a distance along a route.
 *
 * @param {Array<Array<number>>} points Route points as [x, z, y?].
 * @param {Array<number>} lengths Cumulative route distances.
 * @param {number} s Distance along the route.
 * @param {Object} [target] Object to populate.
 *
 * @returns {Object} Position and horizontal direction.
 */
export function along(points, lengths, s, target) {
  let i = 1, end = lengths.length - 1;
  let middle;
  while (i < end) {
    middle = i + Math.floor((end - i) / 2);
    if (lengths[middle] < s) i = middle + 1;
    else end = middle;
  }
  const a = points[i - 1], b = points[i], d = lengths[i] - lengths[i - 1] || 1;
  const t = (s - lengths[i - 1]) / d;
  target ||= /* alloc */ {};
  target.x = a[0] + (b[0] - a[0]) * t;
  target.y = (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t;
  target.z = a[1] + (b[1] - a[1]) * t;
  target.dx = (b[0] - a[0]) / d;
  target.dz = (b[1] - a[1]) / d;
  return target;
}
