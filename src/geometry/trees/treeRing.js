import { ringDirections } from './constants/ringDirections.js';

export function ring(point, radius) {
  const result = [];
  for (const direction of ringDirections) {
    result.push({
      x: point.x + direction.x * radius,
      y: point.y + direction.y * radius,
      ground: point.ground,
    });
  }
  return result;
}
