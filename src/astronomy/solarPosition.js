import { horizontalPosition } from "./horizontalPosition.js";
import { solarTime } from './solarTime.js';
import { radians } from '../globals/radians.js';
import { sinObliquity } from '../globals/sinObliquity.js';
import { cosObliquity } from '../globals/cosObliquity.js';

/**
 * Calculate the solar center position without atmospheric refraction.
 *
 * @param {Date|string|number} date Observation date.
 * @param {number} lat Observer latitude in degrees.
 * @param {number} lng Observer longitude in degrees.
 *
 * @returns {Object} Altitude, azimuth and world-space direction.
 */
export function solarPosition(date, lat, lng) {
  const time = solarTime(date, lat, lng);
  const d = time / 86400000 - 10957.5;
  const mean = (357.5291 + 0.98560028 * d) * radians;
  const longitude = mean + (1.9148 * Math.sin(mean) + 0.02 * Math.sin(2 * mean) +
    0.0003 * Math.sin(3 * mean) + 102.9372 + 180) * radians;
  const declination = Math.asin(Math.sin(longitude) * sinObliquity);
  const ascension = Math.atan2(Math.sin(longitude) * cosObliquity, Math.cos(longitude));
  return horizontalPosition(d, lat, lng, ascension, declination);
}
