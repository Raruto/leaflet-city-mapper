import { along } from './along.js';

export function locateTraffic(state, trip) {
  const { points, lengths, length } = trip.lane;
  let distance = trip.distance + state.elapsed * trip.speed;
  distance -= length * Math.floor(distance / length);
  const { x, y, z, dx, dz } = along(points, lengths, distance);
  return { x: x - dz * state.side, y, z: z + dx * state.side, dx, dz };
}
