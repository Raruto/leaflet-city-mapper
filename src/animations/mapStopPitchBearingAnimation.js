import { cancelCameraAnimation } from './cancelCameraAnimation.js';

export function mapStopPitchBearingAnimation(map) {
  cancelCameraAnimation(map);
  return map;
}
