import { radians } from '../globals/radians.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


export function localPosition(state, latlng) {
  const { map, backend } = state, crs = map.options.crs;
  const origin = crs.project(sceneByLayer.get(backend).location), point = crs.project(latlng);
  const metres = Math.cos(sceneByLayer.get(backend).location.lat * radians);
  return /* allocation: required -- Geometry consumers retain independent vertex coordinates. */ [(point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres];
}
