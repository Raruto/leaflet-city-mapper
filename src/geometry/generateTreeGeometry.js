import { triangleContexts } from '../globals/triangleContexts.js';
import { addGeneratedTriangle } from './addGeneratedTriangle.js';

export function generateTreeGeometry(context, generator, point, style) {
  triangleContexts.push(context);
  try {
    generator(point, style, addGeneratedTriangle);
  } finally {
    triangleContexts.pop();
  }
}
