import { cameraAnimatedOptions } from '../globals/cameraAnimatedOptions.js';
import { mapSetBearing } from './mapSetBearing.js';

/**
 * Reset a map's bearing to north.
 *
 * @param {L.Map} map Map to update.
 * @param {Object} [options] Camera animation options.
 *
 * @returns {L.Map} The updated map.
 */
export function mapResetNorth(map, options = cameraAnimatedOptions) { return mapSetBearing(map, 0, options); }
