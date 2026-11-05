import { mirror } from './mirror.js';

export function boatBenches() {
  const benches = /* allocation: required -- Each boat retains its independent bench part list. */ [];
  let i;
  for (i = 0; i < 12; i++) benches.push(...mirror(0.5, 3.8, -12 + i * 3, -11.3 + i * 3, 3.9, 4.4,
    /* allocation: required -- Each bench pair retains an editable tint independently of the other pairs and boats. */ [0.62, 0.1, 0.1]));
  return benches;
}
