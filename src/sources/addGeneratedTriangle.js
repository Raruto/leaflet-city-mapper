import { triangleContexts } from '../globals/triangleContexts.js';

import { addTriangle } from './addTriangle.js';

export function addGeneratedTriangle(...args) {
  addTriangle(triangleContexts[triangleContexts.length - 1], ...args);
}
