import { speed } from '../globals/speed.js';


/** Evenly spaced starting offsets (metres) for `flow` vehicles/h moving at `velocity` m/s on a `length` metres lane. */

export function vehicleOffsets(length, flow, velocity = speed) {
  const count = Math.round(length * flow / 3600 / velocity);
  const offsets = Array.from(/* allocation: required -- Array.from normalizes the caller-derived vehicle count using native length semantics. */ { length: count });
  let i;
  for (i = 0; i < offsets.length; i++) offsets[i] = (i + 0.5) * length / count;
  return offsets;
}
