import { pitchSkyByMap } from '../weakmaps/pitchSkyByMap.js';
import { sunlightByMap } from '../weakmaps/sunlightByMap.js';
import { radians } from '../globals/radians.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { updateCelestialDisc } from './updateCelestialDisc.js';

/**
 * Update the map sky background and celestial disc positions.
 *
 * @param {Object} state Sunlight state containing the map, discs and projection scratch.
 */
export function updateSky({ map, originalSky, sunDisc, moonDisc, projection }) {
  const sun = sunlightByMap.get(map), sky = pitchSkyByMap.get(map);
  if (sun) map.getContainer().style.setProperty('--leaflet-sky-background', sun.background);
  else if (originalSky) map.getContainer().style.setProperty('--leaflet-sky-background', originalSky);
  else map.getContainer().style.removeProperty('--leaflet-sky-background');
  const size = map.getSize(), pitch = mapGetPitch(map) * radians, bearing = mapGetBearing(map) * radians;
  updateCelestialDisc(sunDisc, sun, sky, size, pitch, bearing, projection);
  updateCelestialDisc(moonDisc, sun?.moon, sky, size, pitch, bearing, projection);
}
