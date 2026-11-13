import { lampDirections } from '../globals/lampDirections.js';

/**
 * Create a ring of lamp points with ground height and fixed UVs.
 *
 * @param {Object} point Ring center and ground height.
 * @param {number} radius Ring radius.
 *
 * @returns {Array<Object>} Lamp ring points.
 */
export function ring(point, radius) {
  const points = /* alloc */ new Array(lampDirections.length);
  let i;
  for (i = 0; i < points.length; i++) {
    points[i] = /* alloc */ {
      x: point.x + lampDirections[i].x * radius,
      y: point.y + lampDirections[i].y * radius, ground: point.ground,
      uv: /* alloc */ [3, 3],
    };
  }
  return points;
}
