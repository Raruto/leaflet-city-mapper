import { box } from '../geometry/box.js';
import { parts } from '../walk/constants/parts.js';
import { skin } from '../walk/constants/skin.js';
import { trousers } from '../walk/constants/trousers.js';
import { paints } from './constants/paints.js';

export function pedestrianModel(index) {
  const model = parts.body.slice();
  model[1] = [model[1][0], model[1][1], model[1][2], paints[index % paints.length]];
  model.push(
    [box(-0.16, -0.02, -0.07, 0.07), 0.08, 0.9, trousers],
    [box(0.02, 0.16, -0.07, 0.07), 0.08, 0.9, trousers],
    [box(-0.3, -0.2, -0.05, 0.05), 0.76, 1.42, skin],
    [box(0.2, 0.3, -0.05, 0.05), 0.76, 1.42, skin],
  );
  return model;
}
