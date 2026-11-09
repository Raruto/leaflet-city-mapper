import { cameraAngles } from '../globals/cameraAngles.js';
import { pointOf } from './toPoint.js';
import { angles } from './cameraAngles.js';


export function project(map, point, inverse = false, limit = false, height = 0) {
  const size = map.getSize(), halfX = size.x / 2, halfY = size.y / 2, distance = size.y * 1.5;
  const result = pointOf(point);
  if (!distance) return result;
  const [cos, sin, tilt, rise] = angles(map, cameraAngles);
  const x = result.x - halfX, y = result.y - halfY;
  if (inverse) {
    const far = size.y * map.options.pitchMaxDistance;
    const denominator = tilt * distance + rise * y;
    let v = denominator * tilt > 0
      ? (y * (distance - tilt * height) + distance * rise * height) / denominator : -far;
    if (limit) v = Math.max(-far, Math.min(far, v));
    const u = x * (distance - rise * v - tilt * height) / distance;
    result.x = cos * u + sin * v + halfX;
    result.y = -sin * u + cos * v + halfY;
    return result;
  }
  const u = cos * x - sin * y, v = sin * x + cos * y;
  const scale = distance / (distance - rise * v - tilt * height);
  result.x = u * scale + halfX;
  result.y = (tilt * v - rise * height) * scale + halfY;
  return result;
}
