/**
 * Resolve a worker task from its message or reject it on abort, worker error or serialized failure.
 *
 * @param {Object} task Pending worker task with resolve, reject and signal.
 * @param {Event} event Message, error, messageerror or abort event.
 */
export function settleGeometryWorker(task, event) {
  if (event.type === 'abort') task.reject(task.signal.reason);
  else if (event.type === 'error') task.reject(/* alloc */ new Error(`Geometry worker failed: ${event.message}`));
  else if (event.type === 'messageerror') task.reject(/* alloc */ new Error('Unable to receive geometry worker buffers'));
  else if (event.data?.error) {
    const error = /* alloc */ new Error(event.data.error.message);
    error.name = event.data.error.name;
    task.reject(error);
  } else task.resolve(event.data);
}
