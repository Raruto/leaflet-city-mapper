import { radians } from './radians.js';

/**
 * Sine of Earth's axial obliquity used in celestial position calculations.
 *
 * @type {number}
 */
export const sinObliquity = Math.sin(23.4397 * radians);
