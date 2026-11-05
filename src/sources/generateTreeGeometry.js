import { pumpState } from '../constants/pumpState.js';
import { addGeneratedTriangle } from './addGeneratedTriangle.js';

export function generateTreeGeometry(context, generator, point, style) {
  pumpState.triangleContexts.push(context);
  try {
    generator(point, style, addGeneratedTriangle);
  } finally {
    pumpState.triangleContexts.pop();
  }
}
