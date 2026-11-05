import { lampDirections } from '../globals/lampDirections.js';

export function ring(point, radius) {
  const points = /* alloc */ new Array(lampDirections.length);
  let i;
  for (i = 0; i < points.length; i++) {
    points[i] = /* alloc */ {
      x: point.x + lampDirections[i].x * radius,
      y: point.y + lampDirections[i].y * radius, ground: point.ground,
      uv: /* alloc */ [3, 3],
    };
  }
  return points;
}
