import { solarTime } from './solarTime.js';
import { horizontalPosition } from "./horizontalPosition.js";
import { radians } from '../globals/radians.js';
import { sinObliquity } from '../globals/sinObliquity.js';
import { cosObliquity } from '../globals/cosObliquity.js';

// Low-precision geocentric lunar orbit; no parallax or atmospheric refraction.

export function moonPosition(date, lat, lng) {
  const d = solarTime(date, lat, lng) / 86400000 - 10957.5;
  const anomaly = (134.963 + 13.064993 * d) * radians;
  const longitude = (218.316 + 13.176396 * d + 6.289 * Math.sin(anomaly)) * radians;
  const latitude = 5.128 * Math.sin((93.272 + 13.229350 * d) * radians) * radians;
  const x = Math.cos(latitude) * Math.cos(longitude);
  const y = Math.cos(latitude) * Math.sin(longitude) * cosObliquity - Math.sin(latitude) * sinObliquity;
  const z = Math.cos(latitude) * Math.sin(longitude) * sinObliquity + Math.sin(latitude) * cosObliquity;
  return horizontalPosition(d, lat, lng, Math.atan2(y, x), Math.asin(z));
}
