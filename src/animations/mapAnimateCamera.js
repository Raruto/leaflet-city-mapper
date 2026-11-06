import { cameraAnimationByMap } from '../weakmaps/cameraAnimationByMap.js';

import { cameraEmptyOptions } from '../globals/cameraEmptyOptions.js';
import { mapSetPitchAndBearing } from '../camera/mapSetPitchAndBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';


export function mapAnimateCamera(map, pitch, bearing, options = cameraEmptyOptions) {
  cancelCameraAnimation(map);
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw /* alloc */ new TypeError('Camera angles must be finite numbers');
  if (!options.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return mapSetPitchAndBearing(map, pitch, bearing);
  }
  const duration = options.duration ?? 0.3;
  if (!Number.isFinite(duration) || duration < 0) throw /* alloc */ new TypeError('Camera duration must be nonnegative');
  const start = performance.now(), fromPitch = mapGetPitch(map), fromBearing = mapGetBearing(map);
  const delta = ((bearing - fromBearing) % 360 + 540) % 360 - 180;
  const animation = /* alloc */ { duration, start, fromPitch, fromBearing, pitch, delta };
  cameraAnimationByMap.set(map, animation);
  scheduleCameraAnimation(map, animation);
  return map;
}
