import { indexState } from '../constants/indexState.js';
import { initializerFor } from './initializerFor.js';

export function resolveNextInitialization() {
  const task = indexState.pendingInitializations.shift();
  try {
    task.initialize = initializerFor(task.type);
  } catch (error) {
    task.error = error;
  }
  return task;
}
