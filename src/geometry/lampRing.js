import { lampDirections } from '../globals/lampDirections.js';

export function ring(point, radius) {
  const points = /* allocation: required -- Each pole section retains its ring across potentially reentrant triangle callbacks. */ [];
  let i;
  for (i = 0; i < 6; i++) {
    points.push(/* allocation: required -- Triangle callbacks may retain each independent pole vertex. */ {
      x: point.x + lampDirections[i].x * radius,
      y: point.y + lampDirections[i].y * radius, ground: point.ground,
      uv: /* allocation: required -- Each retained pole vertex owns its editable UV coordinate. */ [3, 3],
    });
  }
  return points;
}
