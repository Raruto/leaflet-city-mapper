import { L } from '../globals/L.js';
import { triangle } from './appendNativeTriangle.js';
import { disk } from './disk.js';

/**
 * Append a stroke segment with optional square or round caps.
 *
 * @param {Object} context Line style and geometry buffers.
 * @param {L.Point} a Segment start.
 * @param {L.Point} b Segment end.
 * @param {boolean} startCap Whether to add a start cap.
 * @param {boolean} endCap Whether to add an end cap.
 */
export function segment(context, a, b, startCap, endCap) {
  const { options, width, stroke, point } = context;
  const radius = width / 2;
  const anchorA = a, anchorB = b;
  const length = a.distanceTo(b);
  if (!length) return;
  const direction = b.subtract(a).divideBy(length);
  const normal = /* alloc */ new L.Point(-direction.y * radius, direction.x * radius);
  if (options.lineCap === 'square') {
    if (startCap) a = a.subtract(direction.multiplyBy(radius));
    if (endCap) b = b.add(direction.multiplyBy(radius));
  }
  triangle(point, stroke, a.add(normal), a.subtract(normal), b.add(normal), anchorA, anchorA, anchorB);
  triangle(point, stroke, b.add(normal), a.subtract(normal), b.subtract(normal), anchorB, anchorA, anchorB);
  if (options.lineCap === 'round') {
    if (startCap) disk(point, a, radius, stroke);
    if (endCap) disk(point, b, radius, stroke);
  }
}
