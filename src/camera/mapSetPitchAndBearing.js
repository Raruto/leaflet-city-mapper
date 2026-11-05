import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';
import { pluginState } from '../core/pluginState.js';
import { updateSky } from './updateSky.js';

export function mapSetPitchAndBearing(map, pitch, bearing) {
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw /* allocation: required -- Report this invalid camera mutation with its own stack. */ new TypeError('Camera angles must be finite numbers');
  const previousPitch = mapGetPitch(map), previousBearing = mapGetBearing(map);
  pluginState(map)._cameraPitch = Math.max(0, Math.min(85, pitch));
  pluginState(map)._cameraBearing = ((bearing % 360) + 360) % 360;
  if (map._loaded) {
    updateSky.call(map);
    if (previousBearing !== mapGetBearing(map)) map.fire('rotate', /* allocation: required -- Rotate listeners can retain or mutate event data and trigger nested updates. */ { bearing: mapGetBearing(map) });
    if (previousPitch !== mapGetPitch(map)) map.fire('pitch', /* allocation: required -- Pitch listeners can retain or mutate event data and trigger nested updates. */ { pitch: mapGetPitch(map) });
  }
  return map;
}
