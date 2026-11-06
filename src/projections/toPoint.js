import { L } from '../globals/L.js';
export function pointOf(point) {
  return /* alloc */ new L.Point(
    Array.isArray(point) ? point[0] : point.x, Array.isArray(point) ? point[1] : point.y);
}
