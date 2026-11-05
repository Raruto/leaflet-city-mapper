import { state as sharedState } from '../state.js';
import { addTriangle } from './addTriangle.js';

export function addGeneratedTriangle(...args) {
  addTriangle(sharedState.triangleContexts[sharedState.triangleContexts.length - 1], ...args);
}
