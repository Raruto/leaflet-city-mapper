import { radians } from '../globals/radians.js';

import { mapGetBearing } from './mapGetBearing.js';
import { mapGetPitch } from './mapGetPitch.js';

export function angles(map, target) {
  const bearing = mapGetBearing(map) * radians, pitch = mapGetPitch(map) * radians;
  target ||= /* allocation: required -- Unbuffered callers retain independent angle snapshots. */ [];
  target[0] = Math.cos(bearing);
  target[1] = Math.sin(bearing);
  target[2] = Math.cos(pitch);
  target[3] = Math.sin(pitch);
  return target;
}
