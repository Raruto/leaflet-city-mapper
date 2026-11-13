import { triangleContexts } from '../globals/triangleContexts.js';
import { addGeneratedTriangle } from './addGeneratedTriangle.js';

/**
 * Run a point geometry generator with the current triangle destination context.
 *
 * @param {Object} context Destination area geometry.
 * @param {Function} generator Point geometry generator.
 * @param {Object} point Projected point.
 * @param {Object} style Geometry style.
 */
export function generateTreeGeometry(context, generator, point, style) {
  triangleContexts.push(context);
  try {
    generator(point, style, addGeneratedTriangle);
  } finally {
    triangleContexts.pop();
  }
}
