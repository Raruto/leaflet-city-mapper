import { triangle } from './appendNativeTriangle.js';
import { diskAt } from './diskAt.js';

/**
 * Append a triangle fan for a filled elliptical disk.
 *
 * @param {Function} point Vertex projection function.
 * @param {L.Point} center Disk center.
 * @param {number} radius Horizontal radius.
 * @param {Array<number>} target Destination vertices.
 * @param {number} [radiusY] Vertical radius.
 */
export function disk(point, center, radius, target, radiusY = radius) {
  if (!(radius > 0) || !(radiusY > 0)) return;
  const count = Math.max(12, Math.min(128, Math.ceil(Math.PI * Math.sqrt(radius))));
  let i;
  for (i = 0; i < count; i++) {
    triangle(point, target, center, diskAt(center, radius, radiusY, count, i), diskAt(center, radius, radiusY, count, i + 1), center, center, center);
  }
}
