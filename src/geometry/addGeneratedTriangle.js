import { triangleContexts } from '../globals/triangleContexts.js';
import { addTriangle } from './appendAreaTriangle.js';

/**
 * Append a generated triangle to the current geometry context.
 *
 * @param {...*} args Triangle vertices, heights, normal and color.
 */
export function addGeneratedTriangle(...args) {
  addTriangle(triangleContexts[triangleContexts.length - 1], ...args);
}
