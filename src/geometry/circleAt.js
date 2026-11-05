import { tau } from '../globals/tau.js';
import { L } from '../globals/L.js';
export function circleAt(center, radius, radiusY, count, index, offset = 0) {
  const angle = index * tau / count;
  return /* allocation: required -- The caller owns this circle sample independently of later samples. */ new L.Point(center.x + Math.max(0, radius + offset) * Math.cos(angle),
    center.y + Math.max(0, radiusY + offset) * Math.sin(angle));
}
