import { state as sharedState } from '../state.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { fitCameraBounds } from './fitCameraBounds.js';

export function mapGetBoundsCenterZoom(bounds, options) {
  return mapGetPitch(this) || mapGetBearing(this) ? fitCameraBounds(this, bounds, options) :
    sharedState.mapMethods._getBoundsCenterZoom.call(this, bounds, options);
}
