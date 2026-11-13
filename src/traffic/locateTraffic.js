import { along } from '../geometry/interpolateRoute.js';

/**
 * Interpolate a trip's current position along its looping lane and apply the lateral offset.
 *
 * @param {Object} state Traffic layer state.
 * @param {Object} trip Trip with lane, distance and speed.
 * @param {Object} target Reusable output position.
 *
 * @returns {Object} Position and direction along the lane.
 */
export function locateTraffic(state, trip, target) {
  const { points, lengths, length } = trip.lane;
  let distance = trip.distance + state.elapsed * trip.speed;
  distance -= length * Math.floor(distance / length);
  const position = along(points, lengths, distance, target);
  position.x -= position.dz * state.side;
  position.z += position.dx * state.side;
  return position;
}
