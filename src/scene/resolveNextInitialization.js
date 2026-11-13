import { pendingInitializations } from '../globals/pendingInitializations.js';
import { initializerFor } from './initializerFor.js';

/**
 * Dequeue an initialization and resolve its initializer or record an unknown-type error.
 *
 * @returns {Object} Initialization task.
 */
export function resolveNextInitialization() {
  const task = pendingInitializations.shift();
  task.initialize = initializerFor(task.type, task.settings);
  if (!task.initialize) {
    task.error = /* alloc */ new Error(`Unknown layer type: ${task.type}`);
  }
  return task;
}
