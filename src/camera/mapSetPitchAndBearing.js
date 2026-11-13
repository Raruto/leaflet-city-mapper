import { cameraBearingByMap } from '../weakmaps/cameraBearingByMap.js';
import { cameraPitchByMap } from '../weakmaps/cameraPitchByMap.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { updateSky } from './updateSky.js';

/**
 * Set validated camera angles immediately and notify listeners of changes.
 *
 * @param {L.Map} map Map to update.
 * @param {number} pitch Pitch in degrees.
 * @param {number} bearing Bearing in degrees.
 *
 * @returns {L.Map} The updated map.
 *
 * @throws {TypeError} If either angle is not finite.
 * @throws {TypeError} If maxPitch is not finite or is outside 0 to 180 degrees.
 */
export function mapSetPitchAndBearing(map, pitch, bearing) {
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw /* alloc */ new TypeError('Camera angles must be finite numbers');
  if (!Number.isFinite(map.options.maxPitch) || map.options.maxPitch < 0 || map.options.maxPitch > 180) {
    throw /* alloc */ new TypeError('maxPitch must be between 0 and 180 degrees');
  }
  const previousPitch = mapGetPitch(map), previousBearing = mapGetBearing(map);
  cameraPitchByMap.set(map, Math.max(0, Math.min(map.options.maxPitch, pitch)));
  cameraBearingByMap.set(map, ((bearing % 360) + 360) % 360);
  if (map._loaded) {
    updateSky.call(map);
    if (previousBearing !== mapGetBearing(map)) map.fire('rotate', /* alloc */ { bearing: mapGetBearing(map) });
    if (previousPitch !== mapGetPitch(map)) map.fire('pitch', /* alloc */ { pitch: mapGetPitch(map) });
  }
  return map;
}
