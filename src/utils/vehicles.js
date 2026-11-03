import { hull } from "./hull.js";
import { box } from './box.js';
import { glass, tyre } from './glass.js';
import { mirror } from './mirror.js';
import { white } from "./white.js";
import { paints } from './paints.js';
import { headlight } from './headlight.js';
import { taillight } from './taillight.js';

/**
 * `side`: default offset (metres) to the right of the lane centreline. `model(i)` gives the prisms of the i-th vehicle.
 * `lights`: night point lights in model space (see the night lighting grid), e.g. the pool cast by the headlights.
 */
export const vehicles = {
  car: {
    side: 1.8,
    model: i => {
      const paint = paints[i % paints.length];
      return [
        ...mirror(0.7, 0.92, -1.68, -1.02, 0, 0.64, tyre),
        ...mirror(0.7, 0.92, 1.02, 1.68, 0, 0.64, tyre),
        [[[-0.9, -1.95], [-0.72, -2.25], [0.72, -2.25], [0.9, -1.95], [0.9, 2.05], [0.76, 2.25], [-0.76, 2.25], [-0.9, 2.05]],
          0.28, 0.82, paint],
        // Greenhouse: the windscreen leans back, the rear window less.
        [box(-0.84, 0.84, -0.75, 1.6), 0.82, 1.38, glass, box(-0.7, 0.7, -0.05, 1.3)],
        [box(-0.71, 0.71, -0.06, 1.31), 1.38, 1.46, paint],
        ...mirror(0.38, 0.8, -2.3, -2.16, 0.56, 0.76, headlight),
        [box(-0.78, 0.78, 2.16, 2.3), 0.6, 0.76, taillight],
      ];
    },
    lights: [{
      position: [0, 1.2, -6],
      radius: 10,
      color: [1, 0.94, 0.82],
      flux: 800
    }]
  },
  // Panoramic river cruiser, about 60 × 11 m: glass saloon, open upper deck with benches, wheelhouse forward.
  boat: {
    side: 0,
    model: () => [
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
    ],
    lights: [{
      position: [0, 8, 4],
      radius: 30,
      color: [1, 0.8, 0.55],
      flux: 20000
    }]
  },
};
