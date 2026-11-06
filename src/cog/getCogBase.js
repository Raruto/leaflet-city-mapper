import { hasCogProjection } from './hasCogProjection.js';
import { validCogGeoArrays } from './validCogGeoArrays.js';

export function getCogBase(tags, width, height, elevation) {
  const keys = tags.get(34735), scale = tags.get(33550), tie = tags.get(33922);
  if (!validCogGeoArrays(keys, scale, tie) || !hasCogProjection(keys)) {
    throw /* alloc */ new Error('COG must use north-up EPSG:3857 PixelIsArea georeferencing');
  }
  return /* alloc */ { width, height, resolution: scale[0], left: tie[3], top: tie[4], elevation };
}
