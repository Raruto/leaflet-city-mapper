import { geometryWorkerUrl } from '../globals/geometryWorkerUrl.js';
import { startGeometryWorker } from './startGeometryWorker.js';
import { acquireGeometryWorker } from './acquireGeometryWorker.js';

/**
 * Run a cancellable source job, returning successful workers to the map pool and terminating failed ones.
 *
 * @param {L.Map|null|undefined} map Map owning the worker pool, if available.
 * @param {string|null|undefined} url Worker URL; a falsy value selects the default.
 * @param {Object} input Message sent to the worker.
 * @param {AbortSignal} [signal] Cancellation signal.
 *
 * @returns {Promise<*>} The worker's response.
 *
 * @throws {*} Rejects on cancellation, worker creation or execution errors, or a worker-reported failure.
 */
export async function runSourceWorker(map, url, input, signal = /* alloc */ new AbortController().signal) {
  signal.throwIfAborted();
  const entry = acquireGeometryWorker(map, url || geometryWorkerUrl);
  const { worker, pool } = entry;
  const task = /* alloc */ { worker, signal, input };
  entry.task = task;
  let completed = false;
  try {
    const data = await /* alloc */ new Promise(startGeometryWorker.bind(null, task));
    completed = true;
    return data;
  } finally {
    worker.removeEventListener('message', task.onEvent);
    worker.removeEventListener('error', task.onEvent);
    worker.removeEventListener('messageerror', task.onEvent);
    signal.removeEventListener('abort', task.onEvent);
    entry.task = null;
    if (completed && pool && !pool.closed && !signal.aborted) pool.idle.push(entry);
    else {
      if (!entry.closed) worker.terminate();
      if (pool) pool.entries.delete(entry);
    }
    if (entry.blobUrl) {
      URL.revokeObjectURL(entry.blobUrl);
      entry.blobUrl = null;
    }
  }
}
