import { triangleContexts } from '../globals/triangleContexts.js';
import { addTriangle } from './appendAreaTriangle.js';

export function addGeneratedTriangle(...args) {
  addTriangle(triangleContexts[triangleContexts.length - 1], ...args);
}
