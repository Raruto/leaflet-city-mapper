import { hit } from '../picking/hit.js';

export function blocked(east, north, feet) {
  const length = Math.hypot(east, north);
  return length > 1e-6 && hit(this.layer, feet[0], feet[1], feet[2], east / length, -north / length, length + 0.3);
}
