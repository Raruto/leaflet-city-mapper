import { atmosphereStops } from '../globals/atmosphereStops.js';
import { atmosphereColor } from '../globals/atmosphereColor.js';
import { mix } from '../colors/mixColor.js';
import { rgb } from '../colors/formatRGB.js';

/**
 * Interpolate sky background and light tint for a solar altitude.
 *
 * @param {number} altitude Solar altitude in degrees.
 *
 * @returns {Object} CSS background gradient and RGB tint.
 *
 * @throws {Error} If the altitude is not finite.
 */
export function atmosphere(altitude) {
  if (!Number.isFinite(altitude)) {
    throw /* alloc */ new Error('Invalid solar altitude');
  }
  const stops = atmosphereStops;
  let upper = -1;
  let i;
  for (i = 0; i < stops.length; i++) {
    if (stops[i][0] >= altitude) { upper = i; break; }
  }
  const b = stops[upper < 0 ? stops.length - 1 : upper],
        a = stops[Math.max(0, upper - 1)];
  const t = a === b || upper < 0 ? 1 : (altitude - a[0]) / (b[0] - a[0]);
  return /* alloc */ {
    background: `linear-gradient(${rgb(mix(a[1], b[1], t, atmosphereColor))}, ${rgb(mix(a[2], b[2], t, atmosphereColor))})`,
    tint: mix(a[3], b[3], t),
  };
}
