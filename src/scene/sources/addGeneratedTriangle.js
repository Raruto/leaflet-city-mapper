import { addTriangle } from './addTriangle.js';
import { pumpState } from './constants/pumpState.js';

export function addGeneratedTriangle(...args) {
  addTriangle(pumpState.triangleContexts[pumpState.triangleContexts.length - 1], ...args);
}
