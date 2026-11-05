import { solarTime } from './solarTime.js';
import { horizontalPosition } from "./horizontalPosition.js";

// Low-precision geocentric lunar orbit; no parallax or atmospheric refraction.

export function moonPosition(date, lat, lng) {
  const rad = Math.PI / 180, d = solarTime(date, lat, lng) / 86400000 - 10957.5;
  const anomaly = (134.963 + 13.064993 * d) * rad;
  const longitude = (218.316 + 13.176396 * d + 6.289 * Math.sin(anomaly)) * rad;
  const latitude = 5.128 * Math.sin((93.272 + 13.229350 * d) * rad) * rad;
  const obliquity = 23.4397 * rad;
  const x = Math.cos(latitude) * Math.cos(longitude);
  const y = Math.cos(latitude) * Math.sin(longitude) * Math.cos(obliquity) - Math.sin(latitude) * Math.sin(obliquity);
  const z = Math.cos(latitude) * Math.sin(longitude) * Math.sin(obliquity) + Math.sin(latitude) * Math.cos(obliquity);
  return horizontalPosition(d, lat, lng, Math.atan2(y, x), Math.asin(z));
}
