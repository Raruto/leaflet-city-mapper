import { ringDirections } from '../globals/ringDirections.js';


export function ring(point, radius) {
  const result = /* allocation: required -- Each surface retains both rings across potentially reentrant triangle callbacks. */ [];
  let direction;
  for (direction of ringDirections) {
    result.push(/* allocation: required -- Triangle callbacks may retain each independent ring vertex. */ {
      x: point.x + direction.x * radius,
      y: point.y + direction.y * radius,
      ground: point.ground,
    });
  }
  return result;
}
