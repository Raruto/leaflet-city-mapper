import { ringDirections } from '../globals/ringDirections.js';


export function ring(point, radius) {
  const result = /* alloc */ new Array(ringDirections.length);
  let i;
  for (i = 0; i < result.length; i++) {
    result[i] = /* alloc */ {
      x: point.x + ringDirections[i].x * radius,
      y: point.y + ringDirections[i].y * radius,
      ground: point.ground,
    };
  }
  return result;
}
