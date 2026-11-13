import { radians } from './radians.js';

/**
 * Cosine of Earth's axial obliquity used in celestial position calculations.
 *
 * @type {number}
 */
export const cosObliquity = Math.cos(23.4397 * radians);
