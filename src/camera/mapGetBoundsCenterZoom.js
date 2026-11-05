import { fitCameraBounds } from './fitCameraBounds.js';
import { mapCameraState } from '../constants/mapCameraState.js';

export function mapGetBoundsCenterZoom(bounds, options) {
  return this.getPitch() || this.getBearing() ? fitCameraBounds(this, bounds, options) :
    mapCameraState.mapMethods._getBoundsCenterZoom.call(this, bounds, options);
}
