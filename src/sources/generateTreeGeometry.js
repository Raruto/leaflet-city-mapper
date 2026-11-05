import { state as sharedState } from '../state.js';

import { addGeneratedTriangle } from './addGeneratedTriangle.js';

export function generateTreeGeometry(context, generator, point, style) {
  sharedState.triangleContexts.push(context);
  try {
    generator(point, style, addGeneratedTriangle);
  } finally {
    sharedState.triangleContexts.pop();
  }
}
