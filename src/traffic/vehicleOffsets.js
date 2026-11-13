import { speed } from '../globals/speed.js';

/**
 * Compute evenly spaced starting offsets for vehicles moving along a lane.
 *
 * @param {number} length Lane length in metres.
 * @param {number} flow Vehicles per hour.
 * @param {number} [velocity] Vehicle speed in metres per second.
 *
 * @returns {number[]} Starting offsets in metres.
 */
export function vehicleOffsets(length, flow, velocity = speed) {
  const count = Math.round(length * flow / 3600 / velocity);
  const offsets = Array.from(/* alloc */ { length: count });
  let i;
  for (i = 0; i < offsets.length; i++) offsets[i] = (i + 0.5) * length / count;
  return offsets;
}
