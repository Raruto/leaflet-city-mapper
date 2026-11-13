import { mapMethods } from '../globals/mapMethods.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { fitCameraBounds } from './fitCameraBounds.js';

/**
 * Compute a bounds center and zoom using the camera-aware fit when needed.
 *
 * @param {L.LatLngBounds|Array} bounds Geographic bounds.
 * @param {Object} options Fit options.
 *
 * @returns {Object} Fitted center and zoom.
 */
export function mapGetBoundsCenterZoom(bounds, options) {
  return mapGetPitch(this) || mapGetBearing(this) ? fitCameraBounds(this, bounds, options) :
    mapMethods.value._getBoundsCenterZoom.call(this, bounds, options);
}
