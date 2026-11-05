import { pendingInitializations } from '../globals/pendingInitializations.js';


import { initializerFor } from './initializerFor.js';

export function resolveNextInitialization() {
  const task = pendingInitializations.shift();
  try {
    task.initialize = initializerFor(task.type);
  } catch (error) {
    task.error = error;
  }
  return task;
}
