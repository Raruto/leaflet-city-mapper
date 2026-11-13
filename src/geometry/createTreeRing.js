import { ringDirections } from '../globals/ringDirections.js';

/**
 * Create a ring of projected tree points around a center.
 *
 * @param {Object} point Ring center and ground height.
 * @param {number} radius Ring radius.
 *
 * @returns {Array<Object>} Tree ring points.
 */
export function ring(point, radius) {
  const result = /* alloc */ new Array(ringDirections.length);
  let i;
  for (i = 0; i < result.length; i++) {
    result[i] = /* alloc */ {
      x: point.x + ringDirections[i].x * radius,
      y: point.y + ringDirections[i].y * radius,
      ground: point.ground,
    };
  }
  return result;
}
