import { state as sharedState } from '../state.js';

import { initializerFor } from './initializerFor.js';

export function resolveNextInitialization() {
  const task = sharedState.pendingInitializations.shift();
  try {
    task.initialize = initializerFor(task.type);
  } catch (error) {
    task.error = error;
  }
  return task;
}
