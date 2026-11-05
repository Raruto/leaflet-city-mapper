import { mapMethods } from '../globals/mapMethods.js';

import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { fitCameraBounds } from './fitCameraBounds.js';

export function mapGetBoundsCenterZoom(bounds, options) {
  return mapGetPitch(this) || mapGetBearing(this) ? fitCameraBounds(this, bounds, options) :
    mapMethods.value._getBoundsCenterZoom.call(this, bounds, options);
}
