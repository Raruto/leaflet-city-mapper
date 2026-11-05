import { box } from '../geometry/box.js';
import { skin } from '../constants/skin.js';
import { trousers } from '../constants/trousers.js';
import { dark } from '../constants/dark.js';
import { paints } from '../constants/paints.js';

export function bicycleModel(index) {
  const paint = paints[index % paints.length];
  return [
    [box(-0.045, 0.045, -0.85, -0.25), 0.02, 0.62, dark],
    [box(-0.045, 0.045, 0.25, 0.85), 0.02, 0.62, dark],
    [box(-0.06, 0.06, -0.5, 0.5), 0.4, 0.65, paint],
    [box(-0.32, 0.32, -0.58, -0.5), 0.95, 1.02, dark],
    [box(-0.1, 0.1, 0.15, 0.4), 0.85, 0.92, dark],
    [box(-0.18, 0.18, -0.12, 0.28), 1, 1.5, paint],
    [box(-0.11, 0.11, -0.22, 0), 1.5, 1.72, skin],
    [box(-0.13, 0.13, -0.23, 0.01), 1.72, 1.8, paint],
    [box(-0.25, -0.15, -0.5, -0.05), 1, 1.25, skin],
    [box(0.15, 0.25, -0.5, -0.05), 1, 1.25, skin],
    [box(-0.2, -0.08, 0, 0.32), 0.3, 1, trousers],
    [box(0.08, 0.2, -0.25, 0.07), 0.3, 1, trousers],
  ];
}
