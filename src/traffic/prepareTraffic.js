import { disposeTrafficObject } from './disposeTrafficObject.js';
import { groundTraffic } from './groundTraffic.js';

export function prepareTraffic(state) {
  const { layer, lanes } = state;
  const crs = layer._map.options.crs, origin = crs.project(layer.location);
  const metres = Math.cos(layer.location.lat * Math.PI / 180);
  for (const lane of lanes) {
    lane.points = [];
    for (const [lat, lng] of lane.latlngs) {
      const point = crs.project(new L.LatLng(lat, lng));
      lane.points.push([(point.x - origin.x) * metres, -(point.y - origin.y) * metres, 0]);
    }
    lane.lengths = [0];
    for (let i = 1; i < lane.points.length; i++) {
      lane.lengths.push(lane.lengths[i - 1] + Math.hypot(lane.points[i][0] - lane.points[i - 1][0], lane.points[i][1] - lane.points[i - 1][1]));
    }
    lane.length = lane.lengths.at(-1);
  }
  groundTraffic(state);
  disposeTrafficObject(state, state.route);
  state.route = null;
  state.tripsKey = null;
}
