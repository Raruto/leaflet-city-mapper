/**
 * Yield to a timer before continuing asynchronous work.
 *
 * @param {number} [delay=0] Timer delay in milliseconds.
 *
 * @returns {Promise<void>} Resolves when the timer fires.
 */
export function yieldTask(delay = 0) {
  const task = Promise.withResolvers();
  setTimeout(task.resolve, delay);
  return task.promise;
}
