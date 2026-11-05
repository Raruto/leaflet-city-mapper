import { parts } from '../globals/parts.js';
import { paints } from '../globals/paints.js';
import { trousers } from '../globals/trousers.js';
import { skin } from '../globals/skin.js';

import { box } from '../geometry/box.js';

export function pedestrianModel(index) {
  const model = parts.body.slice();
  model[1] = /* allocation: required -- Each pedestrian retains its own painted torso descriptor without mutating the shared body template. */ [model[1][0], model[1][1], model[1][2], paints[index % paints.length]];
  model.push(
    /* allocation: required -- The pedestrian retains its independent left leg descriptor. */ [box(-0.16, -0.02, -0.07, 0.07), 0.08, 0.9, trousers],
    /* allocation: required -- The pedestrian retains its independent right leg descriptor. */ [box(0.02, 0.16, -0.07, 0.07), 0.08, 0.9, trousers],
    /* allocation: required -- The pedestrian retains its independent left arm descriptor. */ [box(-0.3, -0.2, -0.05, 0.05), 0.76, 1.42, skin],
    /* allocation: required -- The pedestrian retains its independent right arm descriptor. */ [box(0.2, 0.3, -0.05, 0.05), 0.76, 1.42, skin],
  );
  return model;
}
