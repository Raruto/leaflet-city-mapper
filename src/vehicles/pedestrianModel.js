import { state as sharedState } from '../state.js';
import { box } from '../geometry/box.js';

export function pedestrianModel(index) {
  const model = sharedState.parts.body.slice();
  model[1] = /* allocation: required -- Each pedestrian retains its own painted torso descriptor without mutating the shared body template. */ [model[1][0], model[1][1], model[1][2], sharedState.paints[index % sharedState.paints.length]];
  model.push(
    /* allocation: required -- The pedestrian retains its independent left leg descriptor. */ [box(-0.16, -0.02, -0.07, 0.07), 0.08, 0.9, sharedState.trousers],
    /* allocation: required -- The pedestrian retains its independent right leg descriptor. */ [box(0.02, 0.16, -0.07, 0.07), 0.08, 0.9, sharedState.trousers],
    /* allocation: required -- The pedestrian retains its independent left arm descriptor. */ [box(-0.3, -0.2, -0.05, 0.05), 0.76, 1.42, sharedState.skin],
    /* allocation: required -- The pedestrian retains its independent right arm descriptor. */ [box(0.2, 0.3, -0.05, 0.05), 0.76, 1.42, sharedState.skin],
  );
  return model;
}
