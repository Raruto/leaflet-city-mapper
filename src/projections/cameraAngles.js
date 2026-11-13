import { radians } from '../globals/radians.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';

/**
 * Write cosine and sine of the map bearing and pitch in radians to a reusable array.
 *
 * @param {L.Map} map Map providing bearing and pitch.
 * @param {number[]} [target] Reusable output array.
 *
 * @returns {number[]} Bearing cosine and sine followed by pitch cosine and sine.
 */
export function angles(map, target) {
  const bearing = mapGetBearing(map) * radians, pitch = mapGetPitch(map) * radians;
  target ||= /* alloc */ [];
  target[0] = Math.cos(bearing);
  target[1] = Math.sin(bearing);
  target[2] = Math.cos(pitch);
  target[3] = Math.sin(pitch);
  return target;
}
