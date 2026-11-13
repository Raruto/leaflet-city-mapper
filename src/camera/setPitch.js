import { mapSetPitch } from './mapSetPitch.js';

/**
 * Set or animate this map's pitch.
 *
 * @param {number} pitch Target pitch in degrees.
 * @param {Object} [options] Camera animation options.
 *
 * @returns {L.Map} This map.
 */
export function setPitch(pitch, options) {
  return mapSetPitch(this, pitch, options);
}
