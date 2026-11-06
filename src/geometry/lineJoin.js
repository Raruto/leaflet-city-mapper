import { L } from '../globals/L.js';
import { triangle } from './nativeTriangle.js';
import { disk } from './disk.js';

export function lineJoin(context, points, i, b, length) {
  const { options, width, point, stroke } = context;
  const a = points[i], radius = width / 2;
  if (options.lineJoin === 'round') {
    disk(point, a, radius, stroke);
    return;
  }
  const previous = a.subtract(points[(i + points.length - 1) % points.length]);
  const previousLength = Math.hypot(previous.x, previous.y);
  if (!previousLength || !length) return;
  const incoming = previous.divideBy(previousLength), outgoing = b.subtract(a).divideBy(length);
  const side = incoming.x * outgoing.y - incoming.y * outgoing.x > 0 ? -1 : 1;
  const n1 = /* alloc */ new L.Point(-incoming.y * side, incoming.x * side);
  const n2 = /* alloc */ new L.Point(-outgoing.y * side, outgoing.x * side);
  const from = a.add(n1.multiplyBy(radius)), to = a.add(n2.multiplyBy(radius));
  const denominator = 1 + n1.x * n2.x + n1.y * n2.y;
  const miter = denominator > 0 ? n1.add(n2).multiplyBy(radius / denominator) : null;
  triangle(point, stroke, from, a, to);
  if (options.lineJoin === 'miter' && miter && Math.hypot(miter.x, miter.y) <= radius * 4) {
    triangle(point, stroke, from, a.add(miter), to);
  }
}
