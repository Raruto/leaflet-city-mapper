import { segment } from './segment.js';
import { lineJoin } from './lineJoin.js';
import { dashedSegment } from './dashedSegment.js';

/**
 * Generate solid or dashed stroke geometry for a projected line or ring.
 *
 * @param {Object} context Line style and geometry buffers.
 * @param {Array<L.Point>} points Projected line points.
 * @param {boolean} closed Whether to connect the last point to the first.
 */
export function line(context, points, closed) {
  const { options, width, dash } = context;
  if (!options.stroke || width <= 0 || points.length < 2) return;
  let distance = Number(options.dashOffset) || 0;
  let period = 0, value, i, a, b, length;
  for (value of dash) period += value;
  for (i = 0; i < points.length - (closed ? 0 : 1); i++) {
    a = points[i], b = points[(i + 1) % points.length], length = a.distanceTo(b);
    if (!dash.length) {
      segment(context, a, b, !closed && i === 0, !closed && i === points.length - 2);
      if (closed || i > 0) lineJoin(context, points, i, b, length);
    } else {
      dashedSegment(context, a, b, length, distance, period);
    }
    distance += length;
  }
}
