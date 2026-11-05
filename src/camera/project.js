import { L } from '../globals/L.js';
import { cameraAngles } from '../globals/cameraAngles.js';
import { pointOf } from './pointOf.js';
import { angles } from './angles.js';


export function project(map, point, inverse = false, limit = false) {
  const half = map.getSize().divideBy(2), distance = map.getSize().y * 1.5;
  if (!distance) return pointOf(point);
  const [cos, sin, tilt, rise] = angles(map, cameraAngles);
  const p = pointOf(point).subtract(half);
  if (inverse) {
    const far = map.getSize().y * map.options.pitchMaxDistance;
    const denominator = tilt * distance + rise * p.y;
    let v = denominator > 0 ? p.y * distance / denominator : -far;
    if (limit) v = Math.max(-far, Math.min(far, v));
    const u = p.x * (distance - rise * v) / distance;
    return /* alloc */ new L.Point(cos * u + sin * v, -sin * u + cos * v).add(half);
  }
  const u = cos * p.x - sin * p.y, v = sin * p.x + cos * p.y;
  const scale = distance / (distance - rise * v);
  return /* alloc */ new L.Point(u * scale, tilt * v * scale).add(half);
}
