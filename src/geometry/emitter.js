/**
 * Construct a point on one axis-aligned plane of a light emitter.
 *
 * @param {Object} point Projected center and ground height.
 * @param {number} u First local coordinate.
 * @param {number} v Second local coordinate.
 * @param {number} axis Plane axis index.
 *
 * @returns {Object} Projected point with ground height and UV coordinates.
 */
export function emitter(point, u, v, axis) {
  const r = 0.65;
  return /* alloc */ {
    x: point.x + (axis === 2 ? 0 : u * r),
    y: point.y + (axis === 1 ? 0 : axis === 2 ? u * r : v * r),
    ground: point.ground + (axis === 0 ? 0 : v * r), uv: /* alloc */ [u, v],
  };
}
