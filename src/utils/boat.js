import { hull } from "./hull.js";
import { box } from './box.js';
import { glass } from './glass.js';
import { mirror } from './mirror.js';
import { white } from "./white.js";

// Panoramic river cruiser, about 60 × 11 m: glass saloon, open upper deck with benches, wheelhouse forward.

export const boat = () => [
  [hull, 0, 0.8, [0.1, 0.16, 0.26]],
  [hull, 0.8, 1.4, white],
  [box(-5, 5, -18, 26), 1.4, 3.7, glass, box(-4.6, 4.6, -17.4, 25.6)],
  ...mirror(4.64, 4.74, -17, 25, 3.25, 3.45, [1.6, 1.25, 0.8]),
  [box(-4.8, 4.8, -17.8, 25.8), 3.7, 3.9, white],
  ...Array.from({ length: 12 }, (_, i) => mirror(0.5, 3.8, -12 + i * 3, -11.3 + i * 3, 3.9, 4.4, [0.62, 0.1, 0.1])).flat(),
  ...mirror(4.65, 4.8, -13.6, 25.8, 3.9, 4.8, white),
  [box(-4.8, 4.8, 25.65, 25.8), 3.9, 4.8, white],
  [box(-2.2, 2.2, -17.6, -14), 3.9, 4.7, white],
  [box(-2.2, 2.2, -17.6, -14), 4.7, 5.5, glass],
  [box(-2.5, 2.5, -18, -13.6), 5.5, 5.7, white],
  [box(-2.45, -2.2, -16.2, -15.8), 5, 5.3, [2, 0.15, 0.1]],
  [box(2.2, 2.45, -16.2, -15.8), 5, 5.3, [0.1, 2, 0.4]],
  [box(-0.1, 0.1, -15.9, -15.7), 5.7, 6.6, white],
  [box(-0.15, 0.15, -15.95, -15.65), 6.6, 6.8, [2, 2, 1.9]],
];
