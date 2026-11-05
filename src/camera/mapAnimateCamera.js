import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { scheduleCameraAnimation } from './scheduleCameraAnimation.js';

export function mapAnimateCamera(pitch, bearing, options = {}) {
  cancelCameraAnimation(this);
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw new TypeError('Camera angles must be finite numbers');
  if (!options.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return this._setPitchAndBearing(pitch, bearing);
  }
  const duration = options.duration ?? 0.3;
  if (!Number.isFinite(duration) || duration < 0) throw new TypeError('Camera duration must be nonnegative');
  const start = performance.now(), fromPitch = this.getPitch(), fromBearing = this.getBearing();
  const delta = ((bearing - fromBearing) % 360 + 540) % 360 - 180;
  const animation = this._cameraAnimation = { duration, start, fromPitch, fromBearing, pitch, delta };
  scheduleCameraAnimation(this, animation);
  return this;
}
