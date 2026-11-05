import { intersects } from './intersects.js';

export function crossesRing(a, b, ring) {
  for (let i = 0; i < ring.length; i++) {
    if (intersects(a, b, ring[i], ring[(i + 1) % ring.length])) return true;
  }
  return false;
}
