import { tau } from '../globals/tau.js';
import { L } from '../globals/L.js';
export function diskAt(center, radius, radiusY, count, index) {
  return /* allocation: required -- The caller owns this disk sample independently of later samples. */ new L.Point(center.x + radius * Math.cos(index * tau / count),
    center.y + radiusY * Math.sin(index * tau / count));
}
