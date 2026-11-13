import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { radians } from '../globals/radians.js';

/**
 * Project a geographic position to local X/Z metres relative to the layer origin.
 *
 * @param {Object} state Projection state containing the map and backend layer.
 * @param {L.LatLng} latlng Geographic position.
 *
 * @returns {number[]} Local coordinates as [x, 0, z].
 */
export function localPosition(state, latlng) {
  const { map, backend: layer } = state, crs = map.options.crs;
  const origin = crs.project(locationByLayer.get(layer)), point = crs.project(latlng);
  const metres = Math.cos(locationByLayer.get(layer).lat * radians);
  return /* alloc */ [(point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres];
}
