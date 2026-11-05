import { intersects } from './intersects.js';

export function crossesRing(a, b, ring) {
  let i;
  for (i = 0; i < ring.length; i++) {
    if (intersects(a, b, ring[i], ring[(i + 1) % ring.length])) return true;
  }
  return false;
}
