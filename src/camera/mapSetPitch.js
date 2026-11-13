import { mapAnimateCamera } from '../animations/mapAnimateCamera.js';
import { mapGetBearing } from './mapGetBearing.js';

/**
 * Set or animate a map's pitch while retaining its current bearing.
 *
 * @param {L.Map} map Map to update.
 * @param {number} pitch Target pitch in degrees.
 * @param {Object} [options] Camera animation options.
 *
 * @returns {L.Map} The updated map.
 */
export function mapSetPitch(map, pitch, options) { return mapAnimateCamera(map, pitch, mapGetBearing(map), options); }
