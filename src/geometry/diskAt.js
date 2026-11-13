import { tau } from '../globals/tau.js';
import { L } from '../globals/L.js';

/**
 * Compute a point on an elliptical disk perimeter.
 *
 * @param {L.Point} center Disk center.
 * @param {number} radius Horizontal radius.
 * @param {number} radiusY Vertical radius.
 * @param {number} count Perimeter subdivision count.
 * @param {number} index Perimeter point index.
 *
 * @returns {L.Point} Perimeter point.
 */
export function diskAt(center, radius, radiusY, count, index) {
  return /* alloc */ new L.Point(center.x + radius * Math.cos(index * tau / count),
    center.y + radiusY * Math.sin(index * tau / count));
}
