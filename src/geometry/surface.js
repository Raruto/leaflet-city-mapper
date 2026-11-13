import { ringDirections } from '../globals/ringDirections.js';
import { ring } from './createTreeRing.js';

/**
 * Generate the side surface between two eight-sided tree rings.
 *
 * @param {Object} point Ring center and ground height.
 * @param {Function} addTriangle Triangle destination callback.
 * @param {number} lowRadius Lower ring radius.
 * @param {number} low Lower ring height.
 * @param {number} highRadius Upper ring radius.
 * @param {number} high Upper ring height.
 * @param {Object} color Surface color.
 */
export function surface(point, addTriangle, lowRadius, low, highRadius, high, color) {
  const lower = ring(point, lowRadius), upper = ring(point, highRadius);
  let i, next, slope, length, nx, nz, ny, normalX, normalZ;
  for (i = 0; i < 8; i++) {
    next = (i + 1) % 8;
    slope = (lowRadius - highRadius) / (high - low);
    length = Math.hypot(1, slope);
    ({ nx, nz } = ringDirections[i]);
    ny = slope / length;
    normalX = nx / length, normalZ = nz / length;
    if (lowRadius) addTriangle(lower[i], low, lower[next], low, upper[next], high, normalX, ny, normalZ, color);
    if (highRadius) addTriangle(lower[i], low, upper[next], high, upper[i], high, normalX, ny, normalZ, color);
  }
}
