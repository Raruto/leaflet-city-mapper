import { paints } from '../globals/paints.js';
import { tyre } from '../globals/tyre.js';
import { glass } from '../globals/glass.js';
import { headlight } from '../globals/headlight.js';
import { taillight } from '../globals/taillight.js';

import { box } from '../geometry/box.js';


import { mirror } from './mirror.js';




export function carModel(i) {
  const paint = paints[i % paints.length];
  return /* alloc */ [
    ...mirror(0.7, 0.92, -1.68, -1.02, 0, 0.64, tyre),
    ...mirror(0.7, 0.92, 1.02, 1.68, 0, 0.64, tyre),
    /* alloc */ [
      /* alloc */ [
        /* alloc */ [-0.9, -1.95],
        /* alloc */ [-0.72, -2.25],
        /* alloc */ [0.72, -2.25],
        /* alloc */ [0.9, -1.95],
        /* alloc */ [0.9, 2.05],
        /* alloc */ [0.76, 2.25],
        /* alloc */ [-0.76, 2.25],
        /* alloc */ [-0.9, 2.05],
      ],
      0.28, 0.82, paint],
    // Greenhouse: the windscreen leans back, the rear window less.
    /* alloc */ [box(-0.84, 0.84, -0.75, 1.6), 0.82, 1.38, glass, box(-0.7, 0.7, -0.05, 1.3)],
    /* alloc */ [box(-0.71, 0.71, -0.06, 1.31), 1.38, 1.46, paint],
    ...mirror(0.38, 0.8, -2.3, -2.16, 0.56, 0.76, headlight),
    /* alloc */ [box(-0.78, 0.78, 2.16, 2.3), 0.6, 0.76, taillight],
  ];
}
