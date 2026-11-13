import { cancelCameraAnimation } from './cancelCameraAnimation.js';

/**
 * Stop the map's current pitch and bearing animation.
 *
 * @param {L.Map} map Map whose animation should stop.
 *
 * @returns {L.Map} The supplied map.
 */
export function mapStopPitchBearingAnimation(map) {
  cancelCameraAnimation(map);
  return map;
}
