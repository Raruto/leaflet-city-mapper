import { mapGetBearing } from './mapGetBearing.js';

/**
 * Get this map's camera bearing.
 *
 * @returns {number} Bearing in degrees.
 */
export function getBearing() {
  return mapGetBearing(this);
}
