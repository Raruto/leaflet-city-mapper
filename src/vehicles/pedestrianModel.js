import { parts } from '../globals/parts.js';
import { paints } from '../globals/paints.js';
import { trousers } from '../globals/trousers.js';
import { skin } from '../globals/skin.js';

import { box } from '../geometry/box.js';

export function pedestrianModel(index) {
  const model = parts.body.slice();
  model[1] = /* alloc */ [model[1][0], model[1][1], model[1][2], paints[index % paints.length]];
  model.push(
    /* alloc */ [box(-0.16, -0.02, -0.07, 0.07), 0.08, 0.9, trousers],
    /* alloc */ [box(0.02, 0.16, -0.07, 0.07), 0.08, 0.9, trousers],
    /* alloc */ [box(-0.3, -0.2, -0.05, 0.05), 0.76, 1.42, skin],
    /* alloc */ [box(0.2, 0.3, -0.05, 0.05), 0.76, 1.42, skin],
  );
  return model;
}
