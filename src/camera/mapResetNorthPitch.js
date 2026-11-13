import { cameraAnimatedOptions } from '../globals/cameraAnimatedOptions.js';
import { mapAnimateCamera } from '../animations/mapAnimateCamera.js';

/**
 * Reset a map's bearing and pitch to zero.
 *
 * @param {L.Map} map Map to update.
 * @param {Object} [options] Camera animation options.
 *
 * @returns {L.Map} The updated map.
 */
export function mapResetNorthPitch(map, options = cameraAnimatedOptions) { return mapAnimateCamera(map, 0, 0, options); }
