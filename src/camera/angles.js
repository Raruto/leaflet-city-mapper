import { state as sharedState } from '../state.js';
import { mapGetBearing } from './mapGetBearing.js';
import { mapGetPitch } from './mapGetPitch.js';

export function angles(map, target) {
  const bearing = mapGetBearing(map) * sharedState.radians, pitch = mapGetPitch(map) * sharedState.radians;
  target ||= /* allocation: required -- Unbuffered callers retain independent angle snapshots. */ [];
  target[0] = Math.cos(bearing);
  target[1] = Math.sin(bearing);
  target[2] = Math.cos(pitch);
  target[3] = Math.sin(pitch);
  return target;
}
