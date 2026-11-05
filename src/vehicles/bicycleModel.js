import { paints } from '../globals/paints.js';
import { dark } from '../globals/dark.js';
import { skin } from '../globals/skin.js';
import { trousers } from '../globals/trousers.js';

import { box } from '../geometry/box.js';

export function bicycleModel(index) {
  const paint = paints[index % paints.length];
  return /* alloc */ [
    /* alloc */ [box(-0.045, 0.045, -0.85, -0.25), 0.02, 0.62, dark],
    /* alloc */ [box(-0.045, 0.045, 0.25, 0.85), 0.02, 0.62, dark],
    /* alloc */ [box(-0.06, 0.06, -0.5, 0.5), 0.4, 0.65, paint],
    /* alloc */ [box(-0.32, 0.32, -0.58, -0.5), 0.95, 1.02, dark],
    /* alloc */ [box(-0.1, 0.1, 0.15, 0.4), 0.85, 0.92, dark],
    /* alloc */ [box(-0.18, 0.18, -0.12, 0.28), 1, 1.5, paint],
    /* alloc */ [box(-0.11, 0.11, -0.22, 0), 1.5, 1.72, skin],
    /* alloc */ [box(-0.13, 0.13, -0.23, 0.01), 1.72, 1.8, paint],
    /* alloc */ [box(-0.25, -0.15, -0.5, -0.05), 1, 1.25, skin],
    /* alloc */ [box(0.15, 0.25, -0.5, -0.05), 1, 1.25, skin],
    /* alloc */ [box(-0.2, -0.08, 0, 0.32), 0.3, 1, trousers],
    /* alloc */ [box(0.08, 0.2, -0.25, 0.07), 0.3, 1, trousers],
  ];
}
