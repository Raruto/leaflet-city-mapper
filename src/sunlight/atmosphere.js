
import { mix } from './mix.js';
import { rgb } from './rgb.js';
import { state as sharedState } from '../state.js';

export function atmosphere(altitude) {
  if (!Number.isFinite(altitude)) {
    throw /* allocation: required -- Preserve the stack of this invalid altitude. */ new Error('Invalid solar altitude');
  }
  const stops = sharedState.atmosphereStops;
  let upper = -1;
  let i;
  for (i = 0; i < stops.length; i++) {
    if (stops[i][0] >= altitude) { upper = i; break; }
  }
  const b = stops[upper < 0 ? stops.length - 1 : upper],
        a = stops[Math.max(0, upper - 1)];
  const t = a === b || upper < 0 ? 1 : (altitude - a[0]) / (b[0] - a[0]);
  return /* allocation: required -- Each map retains an independent atmosphere result. */ {
    background: `linear-gradient(${rgb(mix(a[1], b[1], t, sharedState.atmosphereColor))}, ${rgb(mix(a[2], b[2], t, sharedState.atmosphereColor))})`,
    tint: mix(a[3], b[3], t),
  };
}
