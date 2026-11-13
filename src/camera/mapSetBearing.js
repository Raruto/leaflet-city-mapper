import { mapAnimateCamera } from '../animations/mapAnimateCamera.js';
import { mapGetPitch } from './mapGetPitch.js';

/**
 * Set or animate a map's bearing while retaining its current pitch.
 *
 * @param {L.Map} map Map to update.
 * @param {number} bearing Target bearing in degrees.
 * @param {Object} [options] Camera animation options.
 *
 * @returns {L.Map} The updated map.
 */
export function mapSetBearing(map, bearing, options) { return mapAnimateCamera(map, mapGetPitch(map), bearing, options); }
