import { hull } from '../globals/hull.js';
import { white } from '../globals/white.js';
import { glass } from '../globals/glass.js';


import { box } from '../geometry/box.js';

import { mirror } from './mirror.js';

import { boatBenches } from './boatBenches.js';

// Panoramic river cruiser, about 60 x 11 m.
export function boatModel() {
  return /* allocation: required -- Each boat retains an independent editable part list. */ [
    /* allocation: required -- The boat retains its independent lower hull descriptor. */ [
      hull, 0, 0.8, /* allocation: required -- Each boat owns its editable lower hull tint. */ [0.1, 0.16, 0.26]],
    /* allocation: required -- The boat retains its independent upper hull descriptor. */ [hull, 0.8, 1.4, white],
    /* allocation: required -- The boat retains its independent cabin glazing descriptor. */ [box(-5, 5, -18, 26), 1.4, 3.7, glass, box(-4.6, 4.6, -17.4, 25.6)],
    ...mirror(4.64, 4.74, -17, 25, 3.25, 3.45, /* allocation: required -- Each boat owns its editable cabin light tint. */ [1.6, 1.25, 0.8]),
    /* allocation: required -- The boat retains its independent upper deck descriptor. */ [box(-4.8, 4.8, -17.8, 25.8), 3.7, 3.9, white],
    ...boatBenches(),
    ...mirror(4.65, 4.8, -13.6, 25.8, 3.9, 4.8, white),
    /* allocation: required -- The boat retains its independent stern rail descriptor. */ [box(-4.8, 4.8, 25.65, 25.8), 3.9, 4.8, white],
    /* allocation: required -- The boat retains its independent pilothouse body descriptor. */ [box(-2.2, 2.2, -17.6, -14), 3.9, 4.7, white],
    /* allocation: required -- The boat retains its independent pilothouse glazing descriptor. */ [box(-2.2, 2.2, -17.6, -14), 4.7, 5.5, glass],
    /* allocation: required -- The boat retains its independent pilothouse roof descriptor. */ [box(-2.5, 2.5, -18, -13.6), 5.5, 5.7, white],
    /* allocation: required -- The boat retains its independent port light descriptor. */ [
      box(-2.45, -2.2, -16.2, -15.8), 5, 5.3, /* allocation: required -- Each boat owns its editable port navigation light tint. */ [2, 0.15, 0.1]],
    /* allocation: required -- The boat retains its independent starboard light descriptor. */ [
      box(2.2, 2.45, -16.2, -15.8), 5, 5.3, /* allocation: required -- Each boat owns its editable starboard navigation light tint. */ [0.1, 2, 0.4]],
    /* allocation: required -- The boat retains its independent mast descriptor. */ [box(-0.1, 0.1, -15.9, -15.7), 5.7, 6.6, white],
    /* allocation: required -- The boat retains its independent mast light descriptor. */ [
      box(-0.15, 0.15, -15.95, -15.65), 6.6, 6.8, /* allocation: required -- Each boat owns its editable mast light tint. */ [2, 2, 1.9]],
  ];
}
