import { mapSetBearing } from './mapSetBearing.js';

/**
 * Set or animate this map's bearing.
 *
 * @param {number} bearing Target bearing in degrees.
 * @param {Object} [options] Camera animation options.
 *
 * @returns {L.Map} This map.
 */
export function setBearing(bearing, options) {
  return mapSetBearing(this, bearing, options);
}
