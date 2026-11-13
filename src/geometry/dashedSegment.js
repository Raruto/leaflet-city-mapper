import { segment } from './segment.js';

/**
 * Append dashed geometry along a segment while preserving the pattern phase.
 *
 * @param {Object} context Line geometry context and dash pattern.
 * @param {L.Point} a Segment start.
 * @param {L.Point} b Segment end.
 * @param {number} length Segment length.
 * @param {number} distance Distance at the start of the segment.
 * @param {number} period Dash pattern period.
 *
 * @throws {Error} If dash lengths cannot advance at these coordinates.
 */
export function dashedSegment(context, a, b, length, distance, period) {
  const dash = context.dash;
  let offset = 0, phase = ((distance % period) + period) % period, index = 0, end, delta, skipped = 0;
  while (index < dash.length - 1 && phase >= dash[index]) phase -= dash[index++];
  let remaining = Math.max(0, dash[index] - phase);
  while (offset < length) {
    end = Math.min(length, offset + remaining);
    if (end > offset && index % 2 === 0) {
      delta = b.subtract(a).divideBy(length);
      segment(context, a.add(delta.multiplyBy(offset)), a.add(delta.multiplyBy(end)), true, true);
    }
    if (end <= offset) {
      if (++skipped >= dash.length) throw /* alloc */ new Error('Leaflet dashArray is too small for these coordinates');
    } else skipped = 0;
    offset = end;
    index = (index + 1) % dash.length;
    remaining = dash[index];
  }
}
