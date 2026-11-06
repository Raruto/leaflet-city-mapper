import { degrees } from '../globals/degrees.js';
import { radians } from '../globals/radians.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapSetPitchAndBearing } from '../camera/mapSetPitchAndBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { wrap } from '../utils/wrap.js';

export function updateWalkerView(forward, turn, dt) {
  const map = this.layer._map;
  if (forward || turn) {
    // Swing the camera behind the walker.
    const bearing = mapGetBearing(map) * radians, behind = wrap(-this.state.heading - bearing);
    if (Math.abs(behind) > 1e-3) mapSetPitchAndBearing(map, mapGetPitch(map), (bearing + behind * Math.min(1, dt * 4)) * degrees);
    map.setView(this.state.latlng, map.getZoom(), /* alloc */ { animate: false });
  }
  const target = forward ? 0.9 : 0;
  if (Math.abs(this.swing - target) > 1e-3) {
    this.swing += (target - this.swing) * Math.min(1, dt * 10);
    return true;
  }
  return false;
}
