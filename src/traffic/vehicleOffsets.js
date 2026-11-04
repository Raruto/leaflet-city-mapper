import { speed } from "./speed.js";

/** Evenly spaced starting offsets (metres) for `flow` vehicles/h moving at `velocity` m/s on a `length` metres lane. */

export function vehicleOffsets(length, flow, velocity = speed) {
  const count = Math.round(length * flow / 3600 / velocity);
  return Array.from({ length: count }, (_, i) => (i + 0.5) * length / count);
}
