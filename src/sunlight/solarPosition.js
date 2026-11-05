import { horizontalPosition } from "./horizontalPosition.js";
import { solarTime } from './solarTime.js';

// Solar centre, without atmospheric refraction.

export function solarPosition(date, lat, lng) {
  const time = solarTime(date, lat, lng);
  const rad = Math.PI / 180, d = time / 86400000 - 10957.5;
  const mean = (357.5291 + 0.98560028 * d) * rad;
  const longitude = mean + (1.9148 * Math.sin(mean) + 0.02 * Math.sin(2 * mean) +
    0.0003 * Math.sin(3 * mean) + 102.9372 + 180) * rad;
  const obliquity = 23.4397 * rad;
  const declination = Math.asin(Math.sin(longitude) * Math.sin(obliquity));
  const ascension = Math.atan2(Math.sin(longitude) * Math.cos(obliquity), Math.cos(longitude));
  return horizontalPosition(d, lat, lng, ascension, declination);
}
