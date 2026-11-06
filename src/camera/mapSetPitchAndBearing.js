import { cameraBearingByMap } from '../weakmaps/cameraBearingByMap.js';
import { cameraPitchByMap } from '../weakmaps/cameraPitchByMap.js';


import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

import { updateSky } from './updateSky.js';

export function mapSetPitchAndBearing(map, pitch, bearing) {
  if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw /* alloc */ new TypeError('Camera angles must be finite numbers');
  if (!Number.isFinite(map.options.maxPitch) || map.options.maxPitch < 0 || map.options.maxPitch > 180) {
    throw /* alloc */ new TypeError('maxPitch must be between 0 and 180 degrees');
  }
  const previousPitch = mapGetPitch(map), previousBearing = mapGetBearing(map);
  cameraPitchByMap.set(map, Math.max(0, Math.min(map.options.maxPitch, pitch)));
  cameraBearingByMap.set(map, ((bearing % 360) + 360) % 360);
  if (map._loaded) {
    updateSky.call(map);
    if (previousBearing !== mapGetBearing(map)) map.fire('rotate', /* alloc */ { bearing: mapGetBearing(map) });
    if (previousPitch !== mapGetPitch(map)) map.fire('pitch', /* alloc */ { pitch: mapGetPitch(map) });
  }
  return map;
}
