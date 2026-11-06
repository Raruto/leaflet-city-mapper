import { radians } from '../globals/radians.js';

export function horizontalPosition(d, lat, lng, ascension, declination) {
  const hourAngle = (280.16 + 360.9856235 * d + lng) * radians - ascension;
  const latitude = lat * radians;
  const altitude = Math.asin(Math.sin(latitude) * Math.sin(declination) +
    Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle));
  const southAzimuth = Math.atan2(Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude));
  const azimuth = (southAzimuth / radians + 180 + 360) % 360;
  return /* alloc */ {
    altitude: altitude / radians, azimuth,
    direction: /* alloc */ [Math.sin(azimuth * radians) * Math.cos(altitude), Math.sin(altitude),
    -Math.cos(azimuth * radians) * Math.cos(altitude)]
  };
}
