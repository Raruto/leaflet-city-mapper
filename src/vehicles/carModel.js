import { state as sharedState } from '../state.js';
import { box } from '../geometry/box.js';


import { mirror } from './mirror.js';




export function carModel(i) {
  const paint = sharedState.paints[i % sharedState.paints.length];
  return /* allocation: required -- Each car retains an independent editable part list. */ [
    ...mirror(0.7, 0.92, -1.68, -1.02, 0, 0.64, sharedState.tyre),
    ...mirror(0.7, 0.92, 1.02, 1.68, 0, 0.64, sharedState.tyre),
    /* allocation: required -- The car retains its independent body descriptor. */ [
      /* allocation: required -- Each car retains an independently editable body footprint. */ [
        /* allocation: required -- The body footprint owns its front-left shoulder coordinate. */ [-0.9, -1.95],
        /* allocation: required -- The body footprint owns its front-left tip coordinate. */ [-0.72, -2.25],
        /* allocation: required -- The body footprint owns its front-right tip coordinate. */ [0.72, -2.25],
        /* allocation: required -- The body footprint owns its front-right shoulder coordinate. */ [0.9, -1.95],
        /* allocation: required -- The body footprint owns its rear-right shoulder coordinate. */ [0.9, 2.05],
        /* allocation: required -- The body footprint owns its rear-right tip coordinate. */ [0.76, 2.25],
        /* allocation: required -- The body footprint owns its rear-left tip coordinate. */ [-0.76, 2.25],
        /* allocation: required -- The body footprint owns its rear-left shoulder coordinate. */ [-0.9, 2.05],
      ],
      0.28, 0.82, paint],
    // Greenhouse: the windscreen leans back, the rear window less.
    /* allocation: required -- The car retains its independent glazing descriptor. */ [box(-0.84, 0.84, -0.75, 1.6), 0.82, 1.38, sharedState.glass, box(-0.7, 0.7, -0.05, 1.3)],
    /* allocation: required -- The car retains its independent roof descriptor. */ [box(-0.71, 0.71, -0.06, 1.31), 1.38, 1.46, paint],
    ...mirror(0.38, 0.8, -2.3, -2.16, 0.56, 0.76, sharedState.headlight),
    /* allocation: required -- The car retains its independent taillight descriptor. */ [box(-0.78, 0.78, 2.16, 2.3), 0.6, 0.76, sharedState.taillight],
  ];
}
