import { triangle } from './nativeTriangle.js';
import { disk } from './disk.js';
import { segment } from './segment.js';

export function line(context, points, closed) {
  const { options, width, dash, stroke, point } = context;
  if (!options.stroke || width <= 0 || points.length < 2) return;
  const radius = width / 2;
  let distance = Number(options.dashOffset) || 0;
  let period = 0;
  for (const value of dash) period += value;
  for (let i = 0; i < points.length - (closed ? 0 : 1); i++) {
    const a = points[i], b = points[(i + 1) % points.length], length = a.distanceTo(b);
    if (!dash.length) {
      segment(context, a, b, !closed && i === 0, !closed && i === points.length - 2);
      if (closed || i > 0) {
        if (options.lineJoin === 'round') disk(point, a, radius, stroke);
        else {
          const previous = a.subtract(points[(i + points.length - 1) % points.length]);
          const previousLength = Math.hypot(previous.x, previous.y);
          if (previousLength && length) {
            const incoming = previous.divideBy(previousLength);
            const outgoing = b.subtract(a).divideBy(length);
            const side = incoming.x * outgoing.y - incoming.y * outgoing.x > 0 ? -1 : 1;
            const n1 = new L.Point(-incoming.y * side, incoming.x * side);
            const n2 = new L.Point(-outgoing.y * side, outgoing.x * side);
            const from = a.add(n1.multiplyBy(radius)), to = a.add(n2.multiplyBy(radius));
            const denominator = 1 + n1.x * n2.x + n1.y * n2.y;
            const miter = denominator > 0 ? n1.add(n2).multiplyBy(radius / denominator) : null;
            triangle(point, stroke, from, a, to);
            if (options.lineJoin === 'miter' && miter && Math.hypot(miter.x, miter.y) <= radius * 4) {
              triangle(point, stroke, from, a.add(miter), to);
            }
          }
        }
      }
    } else {
      let offset = 0;
      while (offset < length) {
        let phase = ((distance + offset) % period + period) % period, index = 0;
        while (phase >= dash[index]) phase -= dash[index++];
        const end = Math.min(length, offset + dash[index] - phase);
        if (index % 2 === 0) {
          const delta = b.subtract(a).divideBy(length);
          segment(context, a.add(delta.multiplyBy(offset)), a.add(delta.multiplyBy(end)), true, true);
        }
        offset = end;
      }
    }
    distance += length;
  }
}
