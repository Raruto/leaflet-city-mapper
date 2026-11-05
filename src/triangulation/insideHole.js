import { inside } from './inside.js';

export function insideHole(point, rings) {
  let i;
  for (i = 1; i < rings.length; i++) if (inside(point, rings[i])) return true;
  return false;
}
