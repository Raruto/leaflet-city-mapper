import { mapGetPitch } from './mapGetPitch.js';

/**
 * Get this map's camera pitch.
 *
 * @returns {number} Pitch in degrees.
 */
export function getPitch() {
  return mapGetPitch(this);
}
