
import { mix } from './mix.js';
import { rgb } from './rgb.js';

export function atmosphere(altitude) {
  if (!Number.isFinite(altitude)) {
    throw new Error('Invalid solar altitude');
  }
  const stops = [
    [-18, [3, 7, 20], [17, 28, 54], [0.025, 0.04, 0.09]],
    [-6, [37, 53, 84], [182, 106, 86], [0.12, 0.10, 0.14]],
    [0, [101, 131, 171], [246, 170, 115], [0.38, 0.24, 0.18]],
    [10, [74, 147, 208], [197, 221, 237], [0.80, 0.75, 0.68]],
    [25, [53, 144, 213], [223, 238, 250], [1, 1, 1]],
  ];
  let upper = -1;
  let i;
  for (i = 0; i < stops.length; i++) {
    if (stops[i][0] >= altitude) { upper = i; break; }
  }
  const b = stops[upper < 0 ? stops.length - 1 : upper],
        a = stops[Math.max(0, upper - 1)];
  const t = a === b || upper < 0 ? 1 : (altitude - a[0]) / (b[0] - a[0]);
  return {
    background: `linear-gradient(${rgb(mix(a[1], b[1], t))}, ${rgb(mix(a[2], b[2], t))})`,
    tint: mix(a[3], b[3], t),
  };
}
