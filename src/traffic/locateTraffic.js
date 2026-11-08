import { along } from '../geometry/interpolateRoute.js';

export function locateTraffic(state, trip, target) {
  const { points, lengths, length } = trip.lane;
  let distance = trip.distance + state.elapsed * trip.speed;
  distance -= length * Math.floor(distance / length);
  const position = along(points, lengths, distance, target);
  position.x -= position.dz * state.side;
  position.z += position.dx * state.side;
  return position;
}
