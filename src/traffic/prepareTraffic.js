import { radians } from '../globals/radians.js';
import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { disposeTrafficObject } from './disposeTrafficObject.js';
import { groundTraffic } from './groundTraffic.js';

export function prepareTraffic(state) {
  const { layer, lanes } = state;
  const crs = layer._map.options.crs, origin = crs.project(sceneByLayer.get(layer).location);
  const metres = Math.cos(sceneByLayer.get(layer).location.lat * radians);
  let lane, lat, lng, point, i;
  for (lane of lanes) {
    lane.points = /* allocation: required -- Each lane retains independently mutable local-space coordinates. */ [];
    for ([lat, lng] of lane.latlngs) {
      point = crs.project(/* allocation: required -- Native CRS implementations consume independent input coordinates. */ new L.LatLng(lat, lng));
      lane.points.push(/* allocation: required -- Lane ground updates mutate each retained point independently. */ [(point.x - origin.x) * metres, -(point.y - origin.y) * metres, 0]);
    }
    lane.lengths = /* allocation: required -- Each lane retains its own cumulative distance table. */ [0];
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
