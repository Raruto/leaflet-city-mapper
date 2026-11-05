import { radians } from '../globals/radians.js';
import { cameraByMap } from '../globals/cameraByMap.js';

import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

import { projectCelestialBody } from './projectCelestialBody.js';

export function updateSky({ map, originalSky, sunDisc, moonDisc, projection }) {
  const sun = cameraByMap.get(map)._sunlight, sky = cameraByMap.get(map)._pitchSky;
  if (sun) map.getContainer().style.setProperty('--leaflet-sky-background', sun.background);
  else if (originalSky) map.getContainer().style.setProperty('--leaflet-sky-background', originalSky);
  else map.getContainer().style.removeProperty('--leaflet-sky-background');
  const size = map.getSize(), pitch = mapGetPitch(map) * radians, bearing = mapGetBearing(map) * radians;
  let i, disc, body, point, left, top;
  for (i = 0; i < 2; i++) {
    disc = i === 0 ? sunDisc : moonDisc;
    body = i === 0 ? sun : sun?.moon;
    disc.hidden = true;
    if (!sky || !body || body.altitude <= 0 || !sun) continue;
    if (disc.parentNode !== sky) sky.append(disc);
    point = projectCelestialBody(body.direction, size, pitch, bearing, projection);
    if (!point) continue;
    ({ left, top } = point);
    disc.hidden = left < 0 || left > size.x || top < 0 || top > sky.clientHeight || sky.style.display === 'none';
    disc.style.left = `${left}px`; disc.style.top = `${top}px`;
  }
}
