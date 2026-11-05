
export function horizontalPosition(d, lat, lng, ascension, declination) {
  const rad = Math.PI / 180;
  const hourAngle = (280.16 + 360.9856235 * d + lng) * rad - ascension;
  const latitude = lat * rad;
  const altitude = Math.asin(Math.sin(latitude) * Math.sin(declination) +
    Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle));
  const southAzimuth = Math.atan2(Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude));
  const azimuth = (southAzimuth / rad + 180 + 360) % 360;
  return /* allocation: required -- Callers retain independent celestial positions across dates and maps. */ {
    altitude: altitude / rad, azimuth,
    direction: /* allocation: required -- Each position owns its mutable direction vector. */ [Math.sin(azimuth * rad) * Math.cos(altitude), Math.sin(altitude),
    -Math.cos(azimuth * rad) * Math.cos(altitude)]
  };
}
