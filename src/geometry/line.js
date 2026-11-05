import { triangle } from './nativeTriangle.js';
import { disk } from './disk.js';
import { segment } from './segment.js';

export function line(context, points, closed) {
  const { options, width, dash, stroke, point } = context;
  if (!options.stroke || width <= 0 || points.length < 2) return;
  const radius = width / 2;
  let distance = Number(options.dashOffset) || 0;
  let period = 0;
  let value, i, a, b, length, previous, previousLength, incoming, outgoing, side, n1, n2, from, to;
  let denominator, miter, offset, phase, index, end, delta;
  for (value of dash) period += value;
  for (i = 0; i < points.length - (closed ? 0 : 1); i++) {
    a = points[i], b = points[(i + 1) % points.length], length = a.distanceTo(b);
    if (!dash.length) {
      segment(context, a, b, !closed && i === 0, !closed && i === points.length - 2);
      if (closed || i > 0) {
        if (options.lineJoin === 'round') disk(point, a, radius, stroke);
        else {
          previous = a.subtract(points[(i + points.length - 1) % points.length]);
          previousLength = Math.hypot(previous.x, previous.y);
          if (previousLength && length) {
            incoming = previous.divideBy(previousLength);
            outgoing = b.subtract(a).divideBy(length);
            side = incoming.x * outgoing.y - incoming.y * outgoing.x > 0 ? -1 : 1;
            n1 = /* allocation: required -- The incoming join normal stays private across reentrant projection callbacks. */ new L.Point(-incoming.y * side, incoming.x * side);
            n2 = /* allocation: required -- The outgoing join normal stays private across reentrant projection callbacks. */ new L.Point(-outgoing.y * side, outgoing.x * side);
            from = a.add(n1.multiplyBy(radius)), to = a.add(n2.multiplyBy(radius));
            denominator = 1 + n1.x * n2.x + n1.y * n2.y;
            miter = denominator > 0 ? n1.add(n2).multiplyBy(radius / denominator) : null;
            triangle(point, stroke, from, a, to);
            if (options.lineJoin === 'miter' && miter && Math.hypot(miter.x, miter.y) <= radius * 4) {
              triangle(point, stroke, from, a.add(miter), to);
            }
          }
        }
      }
    } else {
      offset = 0;
      while (offset < length) {
        phase = ((distance + offset) % period + period) % period, index = 0;
        while (phase >= dash[index]) phase -= dash[index++];
        end = Math.min(length, offset + dash[index] - phase);
        if (index % 2 === 0) {
          delta = b.subtract(a).divideBy(length);
          segment(context, a.add(delta.multiplyBy(offset)), a.add(delta.multiplyBy(end)), true, true);
        }
        offset = end;
      }
    }
    distance += length;
  }
}
