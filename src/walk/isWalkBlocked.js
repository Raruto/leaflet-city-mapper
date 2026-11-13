import { hit } from '../picking/hit.js';

/**
 * Cast a horizontal movement ray with walker clearance and return the nearest obstacle normal.
 *
 * @param {number} east Eastward movement in metres.
 * @param {number} north Northward movement in metres.
 * @param {number[]} feet Walker's world-space feet position.
 *
 * @returns {number[]|null|false} Horizontal obstacle normal, or a falsy value when clear.
 */
export function blocked(east, north, feet) {
  const length = Math.hypot(east, north);
  return length > 1e-6 && hit(this.layer, feet[0], feet[1], feet[2], east / length, -north / length, length + 0.3, this.hitData);
}
