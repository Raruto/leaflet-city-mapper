import { mirror } from './mirrorVehiclePart.js';

export function boatBenches() {
  const benches = /* alloc */ [];
  let i;
  for (i = 0; i < 12; i++) benches.push(...mirror(0.5, 3.8, -12 + i * 3, -11.3 + i * 3, 3.9, 4.4,
    /* alloc */ [0.62, 0.1, 0.1]));
  return benches;
}
