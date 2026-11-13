import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { radians } from '../globals/radians.js';
import { L } from '../globals/L.js';
import { disposeTrafficObject } from './disposeTrafficObject.js';
import { groundTraffic } from './groundTraffic.js';

/**
 * Project lane coordinates to local metres, compute distances and heights, and invalidate old route geometry.
 *
 * @param {Object} state Traffic layer state.
 */
export function prepareTraffic(state) {
  const { layer, lanes } = state;
  const crs = layer._map.options.crs, origin = crs.project(locationByLayer.get(layer));
  const metres = Math.cos(locationByLayer.get(layer).lat * radians);
  let lane, lat, lng, point, i;
  for (lane of lanes) {
    lane.points = /* alloc */ [];
    for ([lat, lng] of lane.latlngs) {
      point = crs.project(/* alloc */ new L.LatLng(lat, lng));
      lane.points.push(/* alloc */ [(point.x - origin.x) * metres, -(point.y - origin.y) * metres, 0]);
    }
    lane.lengths = /* alloc */ [0];
    for (i = 1; i < lane.points.length; i++) {
      lane.lengths.push(lane.lengths[i - 1] + Math.hypot(lane.points[i][0] - lane.points[i - 1][0], lane.points[i][1] - lane.points[i - 1][1]));
    }
    lane.length = lane.lengths.at(-1);
  }
  groundTraffic(state);
  disposeTrafficObject(state, state.route);
  state.route = null;
  state.tripsKey = null;
}
