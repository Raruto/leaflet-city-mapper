import { lampDirections } from '../globals/lampDirections.js';

export function ring(point, radius) {
  const points = /* alloc */ [];
  let i;
  for (i = 0; i < 6; i++) {
    points.push(/* alloc */ {
      x: point.x + lampDirections[i].x * radius,
      y: point.y + lampDirections[i].y * radius, ground: point.ground,
      uv: /* alloc */ [3, 3],
    });
  }
  return points;
}
