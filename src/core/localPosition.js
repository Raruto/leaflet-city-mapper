import { pluginState } from './pluginState.js';
export function localPosition(state, latlng) {
  const { map, backend } = state, crs = map.options.crs;
  const origin = crs.project(pluginState(backend).location), point = crs.project(latlng);
  const metres = Math.cos(pluginState(backend).location.lat * Math.PI / 180);
  return /* allocation: required -- Geometry consumers retain independent vertex coordinates. */ [(point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres];
}
