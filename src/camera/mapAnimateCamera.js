import { mapSetPitchAndBearing } from './mapSetPitchAndBearing.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { pluginState } from '../core/pluginState.js';
import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';
import { state as sharedState } from '../state.js';

export function mapAnimateCamera(map, pitch, bearing, options = sharedState.allocationCameraEmptyOptions) {
  cancelCameraAnimation(map);
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw /* allocation: required -- Report this invalid animation call with its own stack. */ new TypeError('Camera angles must be finite numbers');
  if (!options.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return mapSetPitchAndBearing(map, pitch, bearing);
  }
  const duration = options.duration ?? 0.3;
  if (!Number.isFinite(duration) || duration < 0) throw /* allocation: required -- Report this invalid animation duration with its own stack. */ new TypeError('Camera duration must be nonnegative');
  const start = performance.now(), fromPitch = mapGetPitch(map), fromBearing = mapGetBearing(map);
  const delta = ((bearing - fromBearing) % 360 + 540) % 360 - 180;
  const animation = pluginState(map)._cameraAnimation = /* allocation: required -- Queued animation identity distinguishes cancellation and replacement across frames. */ { duration, start, fromPitch, fromBearing, pitch, delta };
  scheduleCameraAnimation(map, animation);
  return map;
}
