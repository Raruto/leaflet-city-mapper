import { inside } from './inside.js';

export function insideHole(point, rings) {
  for (let i = 1; i < rings.length; i++) if (inside(point, rings[i])) return true;
  return false;
}
