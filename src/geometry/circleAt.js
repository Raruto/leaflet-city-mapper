import { tau } from '../globals/tau.js';
import { L } from '../globals/L.js';

/**
 * Compute a point on an elliptical ring with an optional radial offset.
 *
 * @param {L.Point} center Ellipse center.
 * @param {number} radius Horizontal radius.
 * @param {number} radiusY Vertical radius.
 * @param {number} count Ring subdivision count.
 * @param {number} index Ring point index.
 * @param {number} [offset] Offset applied to both radii.
 *
 * @returns {L.Point} Ring point.
 */
export function circleAt(center, radius, radiusY, count, index, offset = 0) {
  const angle = index * tau / count;
  return /* alloc */ new L.Point(center.x + Math.max(0, radius + offset) * Math.cos(angle),
    center.y + Math.max(0, radiusY + offset) * Math.sin(angle));
}
