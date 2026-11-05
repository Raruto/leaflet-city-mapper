import { ringDirections } from '../globals/ringDirections.js';


export function ring(point, radius) {
  const result = /* alloc */ [];
  let direction;
  for (direction of ringDirections) {
    result.push(/* alloc */ {
      x: point.x + direction.x * radius,
      y: point.y + direction.y * radius,
      ground: point.ground,
    });
  }
  return result;
}
