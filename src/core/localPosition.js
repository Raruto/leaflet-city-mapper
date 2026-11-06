import { locationByLayer } from '../weakmaps/locationByLayer.js';

import { radians } from '../globals/radians.js';


export function localPosition(state, latlng) {
  const { map, backend: layer } = state, crs = map.options.crs;
  const origin = crs.project(locationByLayer.get(layer)), point = crs.project(latlng);
  const metres = Math.cos(locationByLayer.get(layer).lat * radians);
  return /* alloc */ [(point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres];
}
