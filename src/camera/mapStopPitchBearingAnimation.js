import { cancelCameraAnimation } from './cancelCameraAnimation.js';

export function mapStopPitchBearingAnimation() {
  cancelCameraAnimation(this);
  return this;
}
