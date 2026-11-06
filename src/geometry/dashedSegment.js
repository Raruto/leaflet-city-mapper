import { segment } from './segment.js';

export function dashedSegment(context, a, b, length, distance, period) {
  const dash = context.dash;
  let offset = 0, phase, index, end, delta;
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
