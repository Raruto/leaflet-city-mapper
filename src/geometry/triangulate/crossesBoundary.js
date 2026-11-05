import { crossesRing } from './crossesRing.js';

export function crossesBoundary(a, b, polygon, rings) {
  if (crossesRing(a, b, polygon)) return true;
  for (let i = 1; i < rings.length; i++) if (crossesRing(a, b, rings[i])) return true;
  return false;
}
